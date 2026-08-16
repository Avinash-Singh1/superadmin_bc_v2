import { NgModule } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BlogManagementRoutingModule } from './blog-management-routing.module';

// Components
import { DashboardComponent } from './dashboard/dashboard.component';
import { BlogListComponent } from './blog-list/blog-list.component';
import { BlogEditorComponent } from './blog-editor/blog-editor.component';
import { CategoryListComponent } from './category-list/category-list.component';
import { TagListComponent } from './tag-list/tag-list.component';
import { AuthorListComponent } from './author-list/author-list.component';

// Services
import { BlogService } from './services/blog.service';
import { CategoryService } from './services/category.service';
import { TagService } from './services/tag.service';
import { AuthorService } from './services/author.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    BlogManagementRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    // Import standalone components
    DashboardComponent,
    BlogListComponent,
    BlogEditorComponent,
    CategoryListComponent,
    TagListComponent,
    AuthorListComponent
  ],
  providers: [
    BlogService,
    CategoryService,
    TagService,
    AuthorService,
    DatePipe,
    DecimalPipe
  ]
})
export class BlogManagementModule { }
