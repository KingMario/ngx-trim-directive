import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { NgxTrimDirectiveModule } from '../../projects/ngx-trim-directive/src/lib/ngx-trim-directive.module';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,

    NgxTrimDirectiveModule,
  ],
  providers: [],
  bootstrap: [ AppComponent ],
})
export class AppModule {
}
