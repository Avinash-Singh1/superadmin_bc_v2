import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { BlogListComponent } from './blog-list/blog-list.component';
import { BlogEditorComponent } from './blog-editor/blog-editor.component';
import { CategoryListComponent } from './category-list/category-list.component';
import { TagListComponent } from './tag-list/tag-list.component';
import { AuthorListComponent } from './author-list/author-list.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'blog-list',
    component: BlogListComponent
  },
  {
    path: 'blogs/create',
    component: BlogEditorComponent
  },
  {
    path: 'blogs/edit/:id',
    component: BlogEditorComponent
  },
  {
    path: 'category-list',
    component: CategoryListComponent
  },
  {
    path: 'tag-list',
    component: TagListComponent
  },
  {
    path: 'author-list',
    component: AuthorListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BlogManagementRoutingModule { }
