import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgSelectModule } from '@ng-select/ng-select';
import { Editor, Toolbar, NgxEditorModule } from 'ngx-editor';
import { BlogService } from '../services/blog.service';
import { CategoryService } from '../services/category.service';
import { TagService } from '../services/tag.service';
import { AuthorService } from '../services/author.service';

@Component({
  selector: 'app-blog-editor',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgSelectModule, NgxEditorModule],
  templateUrl: './blog-editor.component.html',
  styleUrls: ['./blog-editor.component.scss']
})
export class BlogEditorComponent implements OnInit, OnDestroy {
  // ngx-editor configuration
  editor!: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];
  
  blogForm!: FormGroup;
  isEditMode = false;
  blogId: string | null = null;
  isLoading = false;
  isSaving = false;
  uploadingField = '';
  uploadError = '';
  imagePreviews: { [field: string]: string } = {};

  // Preview state
  isPreviewOpen = false;
  previewContent: SafeHtml = '';

  // Data
  categories: any[] = [];
  tags: any[] = [];
  authors: any[] = [];

  // FAQ Management
  faqs: Array<{ question: string; answer: string }> = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private blogService: BlogService,
    private categoryService: CategoryService,
    private tagService: TagService,
    private authorService: AuthorService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.editor = new Editor();
    this.initForm();
    this.loadDropdownData();
    
    // Check if edit mode
    this.blogId = this.route.snapshot.paramMap.get('id');
    if (this.blogId) {
      this.isEditMode = true;
      this.loadBlog(this.blogId);
    }
  }

  ngOnDestroy(): void {
    if (this.editor) {
      this.editor.destroy();
    }
    Object.values(this.imagePreviews).forEach((preview) => {
      if (preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    });
  }

  initForm(): void {
    this.blogForm = this.fb.group({
      title: ['', Validators.required],
      slug: [''],
      metaTitle: [''],
      metaDescription: [''],
      canonicalUrl: [''],
      featuredImage: ['', Validators.required],
      thumbnail: [''],
      bannerImage: [''],
      ogImage: [''],
      author: ['', Validators.required],
      category: ['', Validators.required],
      tags: [[]],
      summary: ['', Validators.required],
      content: ['', Validators.required],
      faqs: [[]],
      ctaTitle: [''],
      ctaDescription: [''],
      ctaButtonText: [''],
      ctaButtonLink: [''],
      keywords: [''],
      schemaType: ['Article'],
      publishDate: [''],
      scheduleDate: [''],
      status: ['draft'],
      isFeatured: [false],
      isTrending: [false]
    });

    // Auto-generate slug from title
    this.blogForm.get('title')?.valueChanges.subscribe(title => {
      if (!this.isEditMode && title) {
        const slug = this.generateSlug(title);
        this.blogForm.patchValue({ slug }, { emitEvent: false });
      }
    });

    // Auto-populate scheduleDate with current local date/time when status changed to 'scheduled'
    this.blogForm.get('status')?.valueChanges.subscribe(status => {
      if (status === 'scheduled') {
        const currentSchedule = this.blogForm.get('scheduleDate')?.value;
        if (!currentSchedule) {
          this.blogForm.patchValue({ scheduleDate: this.getNowLocalISOString() });
        }
      }
    });
  }

  private getNowLocalISOString(): string {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
  }

  loadDropdownData(): void {
    // Load categories
    this.categoryService.getCategories(true).subscribe(
      response => {
        this.categories = response.data || response.result || [];
      }
    );

    // Load tags
    this.tagService.getTags(true).subscribe(
      response => {
        this.tags = response.data || response.result || [];
      }
    );

    // Load authors
    this.authorService.getAuthors(true).subscribe(
      response => {
        this.authors = response.data || response.result || [];
      }
    );
  }

  loadBlog(id: string): void {
    this.isLoading = true;
    this.blogService.getBlogById(id).subscribe(
      response => {
        const blog = response.data || response.result;
        
        // Format scheduleDate for datetime-local input YYYY-MM-DDTHH:mm
        let formattedScheduleDate = '';
        if (blog.scheduleDate) {
          try {
            const dateObj = new Date(blog.scheduleDate);
            const tzOffset = dateObj.getTimezoneOffset() * 60000;
            formattedScheduleDate = new Date(dateObj.getTime() - tzOffset).toISOString().slice(0, 16);
          } catch (e) {
            formattedScheduleDate = blog.scheduleDate;
          }
        }

        // Format keywords array to comma-separated string for form input
        const keywordsStr = Array.isArray(blog.keywords) 
          ? blog.keywords.join(', ') 
          : (blog.keywords || '');

        this.blogForm.patchValue({
          title: blog.title,
          slug: blog.slug,
          metaTitle: blog.metaTitle || blog.title || '',
          metaDescription: blog.metaDescription || blog.summary || '',
          canonicalUrl: blog.canonicalUrl,
          featuredImage: blog.featuredImage,
          thumbnail: blog.thumbnail,
          bannerImage: blog.bannerImage,
          ogImage: blog.ogImage,
          author: blog.author._id || blog.author,
          category: blog.category._id || blog.category,
          tags: blog.tags?.map((t: any) => t._id || t) || [],
          summary: blog.summary,
          content: blog.content,
          ctaTitle: blog.ctaSection?.title || '',
          ctaDescription: blog.ctaSection?.description || '',
          ctaButtonText: blog.ctaSection?.buttonText || '',
          ctaButtonLink: blog.ctaSection?.buttonLink || '',
          keywords: keywordsStr,
          schemaType: blog.schemaType || 'Article',
          publishDate: blog.publishDate,
          scheduleDate: formattedScheduleDate,
          status: blog.status,
          isFeatured: blog.isFeatured,
          isTrending: blog.isTrending
        });
        this.faqs = blog.faqs || [];
        this.isLoading = false;
      },
      error => {
        console.error('Load blog error:', error);
        alert('Failed to load blog');
        this.isLoading = false;
      }
    );
  }

  generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  onImageUpload(event: any, field: string): void {
    const file: File | undefined = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.uploadError = 'Please choose a valid image file.';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.uploadError = 'Image files must be 5 MB or smaller.';
      return;
    }

    const previousPreview = this.imagePreviews[field];
    if (previousPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(previousPreview);
    }
    this.imagePreviews[field] = URL.createObjectURL(file);
    this.uploadingField = field;
    this.uploadError = '';
    this.isSaving = true;
    this.blogService.uploadImage(file, field).subscribe({
      next: (response) => {
        const uploadedImage = response?.result || response?.data || response;
        const imageUrl = uploadedImage?.urls?.large || uploadedImage?.urls?.medium || uploadedImage?.urls?.original || uploadedImage?.url;
        if (imageUrl) {
          this.blogForm.patchValue({ [field]: imageUrl });
          this.blogForm.get(field)?.markAsTouched();
          this.blogForm.get(field)?.updateValueAndValidity();
          // Keep the local object URL for this editing session. It provides an
          // immediate preview even while a CDN is still propagating or the
          // uploaded object is not yet publicly readable.
        } else {
          this.uploadError = 'The upload completed but did not return an image URL.';
        }
        this.isSaving = false;
        this.uploadingField = '';
      },
      error: (error) => {
        console.error('Image upload error:', error);
        this.uploadError = error?.error?.message || 'Image upload failed. Please try again.';
        this.isSaving = false;
        this.uploadingField = '';
      }
    });
  }

  addFaq(): void {
    this.faqs.push({ question: '', answer: '' });
  }

  removeFaq(index: number): void {
    this.faqs.splice(index, 1);
  }

  saveDraft(): void {
    this.blogForm.patchValue({ status: 'draft' });
    this.saveBlog();
  }

  publish(): void {
    this.blogForm.patchValue({ status: 'published', publishDate: new Date() });
    this.saveBlog();
  }

  saveBlog(): void {
    if (this.blogForm.invalid) {
      this.blogForm.markAllAsTouched();
      const requiredFields = [
        ['title', 'Title'],
        ['summary', 'Summary'],
        ['author', 'Author'],
        ['category', 'Category'],
        ['content', 'Content'],
        ['featuredImage', 'Featured image']
      ]
        .filter(([controlName]) => this.blogForm.get(controlName)?.invalid)
        .map(([, label]) => label);
      alert(`Complete the required fields: ${requiredFields.join(', ')}`);
      return;
    }

    this.isSaving = true;
    
    const formData = this.blogForm.value;
    
    // Sanitize the content before saving to remove inline styles and normalize HTML
    const sanitizedContent = this.sanitizeContent(formData.content || '');
    
    // Process keywords: string -> string[]
    const keywordsArray = typeof formData.keywords === 'string'
      ? formData.keywords.split(',').map((k: string) => k.trim()).filter(Boolean)
      : (Array.isArray(formData.keywords) ? formData.keywords : []);

    // Process scheduleDate: if scheduled and date not selected, default to current Date/Time
    let scheduleDateVal = formData.scheduleDate ? new Date(formData.scheduleDate) : null;
    if (formData.status === 'scheduled' && !scheduleDateVal) {
      scheduleDateVal = new Date();
    }

    const blogData: any = {
      ...formData,
      content: sanitizedContent,
      keywords: keywordsArray,
      scheduleDate: scheduleDateVal,
      metaTitle: formData.metaTitle?.trim() || formData.title,
      metaDescription: formData.metaDescription?.trim() || formData.summary,
      faqs: this.faqs,
      ctaSection: {
        title: formData.ctaTitle,
        description: formData.ctaDescription,
        buttonText: formData.ctaButtonText,
        buttonLink: formData.ctaButtonLink
      }
    };

    const request = this.isEditMode
      ? this.blogService.updateBlog(this.blogId!, blogData)
      : this.blogService.createBlog(blogData);

    request.subscribe(
      response => {
        alert(`Blog ${this.isEditMode ? 'updated' : 'created'} successfully!`);
        this.isSaving = false;
        this.router.navigate(['/theme/blog-management/blog-list']);
      },
      error => {
        console.error('Save blog error:', error);
        alert(error?.error?.result?.error?.message || error?.error?.message || 'Failed to save blog');
        this.isSaving = false;
      }
    );
  }

  cancel(): void {
    if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      this.router.navigate(['/theme/blog-management/blog-list']);
    }
  }

  private sanitizeContent(html: string): string {
    if (!html) return '';
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Remove inline styles from all elements
    tempDiv.querySelectorAll('[style]').forEach(el => {
      el.removeAttribute('style');
    });
    
    // Remove class attributes (except for specific allowed classes)
    tempDiv.querySelectorAll('[class]').forEach(el => {
      const classes = el.getAttribute('class') || '';
      if (!classes.includes('image-') && !classes.includes('table-')) {
        el.removeAttribute('class');
      }
    });
    
    // Remove font tags and other legacy HTML
    tempDiv.querySelectorAll('font, center, big, small').forEach(el => {
      const span = document.createElement('span');
      span.innerHTML = el.innerHTML;
      el.replaceWith(span);
    });
    
    // Remove ALL <br> tags that are direct children of lists
    tempDiv.querySelectorAll('ul, ol').forEach(list => {
      const brs = list.querySelectorAll(':scope > br');
      brs.forEach(br => br.remove());
    });
    
    // Remove ALL <br> tags inside list items
    tempDiv.querySelectorAll('li').forEach(li => {
      const brs = li.querySelectorAll('br');
      brs.forEach(br => br.remove());
    });
    
    // Remove multiple consecutive <br> tags
    const allBrs = Array.from(tempDiv.querySelectorAll('br'));
    allBrs.forEach((br) => {
      let count = 1;
      let next = br.nextSibling;
      
      while (next) {
        if (next.nodeType === Node.ELEMENT_NODE && next.nodeName === 'BR') {
          count++;
          const toRemove = next;
          next = next.nextSibling;
          toRemove.remove();
        } else if (next.nodeType === Node.TEXT_NODE && !next.textContent?.trim()) {
          next = next.nextSibling;
        } else {
          break;
        }
      }
      
      if (count > 1) {
        br.remove();
      }
      
      const prev = br.previousElementSibling;
      const nextEl = br.nextElementSibling;
      const blockElements = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DIV', 'UL', 'OL', 'TABLE', 'HR', 'BLOCKQUOTE'];
      
      if (prev && nextEl && 
          (blockElements.includes(prev.nodeName) || blockElements.includes(nextEl.nodeName))) {
        br.remove();
      }
    });
    
    // Remove excessive empty paragraphs
    const paragraphs = tempDiv.querySelectorAll('p');
    let emptyCount = 0;
    paragraphs.forEach(p => {
      if (!p.textContent?.trim() && !p.querySelector('img, iframe')) {
        emptyCount++;
        if (emptyCount > 1) {
          p.remove();
        }
      } else {
        emptyCount = 0;
      }
    });
    
    // Ensure images don't have width/height attributes
    tempDiv.querySelectorAll('img').forEach(img => {
      img.removeAttribute('width');
      img.removeAttribute('height');
      if (!img.alt) {
        img.alt = 'Article image';
      }
    });
    
    // Remove empty table cells that might cause layout issues
    tempDiv.querySelectorAll('td, th').forEach(cell => {
      if (!cell.textContent?.trim() && !cell.querySelector('img, br')) {
        cell.innerHTML = '&nbsp;';
      }
    });
    
    // Remove table attributes for styling
    tempDiv.querySelectorAll('table').forEach(table => {
      table.removeAttribute('border');
      table.removeAttribute('cellpadding');
      table.removeAttribute('cellspacing');
      table.removeAttribute('style');
    });
    
    return tempDiv.innerHTML;
  }

  getContentLength(): number {
    const content = this.blogForm.get('content')?.value || '';
    const textContent = content.replace(/<[^>]*>/g, '');
    return textContent.length;
  }

  openPreview(): void {
    let content = this.blogForm.get('content')?.value;
    
    if (!content) {
      content = '<p>No content yet. Start writing your blog post!</p>';
    }
    
    content = this.decodeHtmlEntities(content);
    this.previewContent = this.sanitizer.bypassSecurityTrustHtml(content);
    this.isPreviewOpen = true;
    document.body.style.overflow = 'hidden';
  }

  private decodeHtmlEntities(html: string): string {
    if (!html) return '';
    
    const textarea = document.createElement('textarea');
    textarea.innerHTML = html;
    return textarea.value;
  }

  closePreview(): void {
    this.isPreviewOpen = false;
    document.body.style.overflow = 'auto';
  }

  getPreviewContent(): SafeHtml {
    let content = this.blogForm.get('content')?.value;
    
    if (!content) {
      content = '<p>No content yet. Start writing your blog post!</p>';
    }
    
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

  getPreviewCategory(): any {
    const categoryId = this.blogForm.get('category')?.value;
    return this.categories.find(c => c._id === categoryId) || null;
  }

  getPreviewAuthor(): any {
    const authorId = this.blogForm.get('author')?.value;
    return this.authors.find(a => a._id === authorId) || null;
  }

  getPreviewTags(): any[] {
    const tagIds = this.blogForm.get('tags')?.value || [];
    return this.tags.filter(t => tagIds.includes(t._id));
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  estimateReadingTime(): number {
    const content = this.blogForm.get('content')?.value || '';
    const textContent = content.replace(/<[^>]*>/g, '');
    const words = textContent.trim().split(/\s+/).length;
    const wordsPerMinute = 200;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes || 1;
  }
}
