import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Inject } from '@angular/core';
import { ngf } from 'angular-file';
import { NgxFileDropEntry, FileSystemFileEntry } from 'ngx-file-drop';
import { UploaderOptions, UploadFile, UploadInput, UploadOutput } from 'ngx-uploader';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  //Angular-File variables
  files: File[] = [];
  file: File;

  //ngx-uploader variables
  options: UploaderOptions = {
    concurrency: 3,
    maxUploads: 3,
    maxFileSize: 100000
  }
  uploaderFiles: UploadFile[] = [];
  uploadInput: EventEmitter<UploadInput> = new EventEmitter<UploadInput>();

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) {}

  //Take the change event, get the new file from it, add it to a FormData object, and upload
  onFileSelected(event) {
    let selectedFile: File = event.target.files[0];
    
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile, selectedFile.name);
      const upload$ = this.http.post(this.baseUrl + 'FileUpload', formData);
      upload$.subscribe(resp => {
        console.log(resp);
      });
    }
  }

  // Upload logic for the Angular-File package
  ngfChange() {
    if(this.files) {
      const formData = new FormData();
      this.files.forEach(file => {
        formData.append('file', file, file.name);
      });
      const upload$ = this.http.post(this.baseUrl + 'FileUpload', formData);
      upload$.subscribe(resp => {
        console.log(resp);
      });
    }
  }

  onUploadOutput(output: UploadOutput): void {
    console.log(output)
    console.log(this.uploaderFiles)
    switch (output.type) {
      case 'allAddedToQueue':
        // uncomment this if you want to auto upload files when added
        // const event: UploadInput = {
        //   type: 'uploadAll',
        //   url: this.baseUrl + 'FileUpload',
        //   method: 'POST',
        //   data: { foo: 'bar' }
        // };
        // this.uploadInput.emit(event);
        break;
      case 'addedToQueue':
        if (typeof output.file !== 'undefined') {
          this.uploaderFiles.push(output.file);
        }
        break;
      case 'uploading':
        if (typeof output.file !== 'undefined') {
          // update current data in files array for uploading file
          const index = this.uploaderFiles.findIndex(file => typeof output.file !== 'undefined' && file.id === output.file.id);
          this.uploaderFiles[index] = output.file;
        }
        break;
      case 'removed':
        // remove file from array when removed
        this.uploaderFiles = this.uploaderFiles.filter((file: UploadFile) => file !== output.file);
        break;
      case 'done':
        // The file is downloaded
        break;
    }
  }

  startUpload(): void {
    const event: UploadInput = {
      type: 'uploadAll',
      url: this.baseUrl + 'FileUpload',
      method: 'POST',
      data: { foo: 'bar' }
    };

    this.uploadInput.emit(event);
  }

  cancelUpload(id: string): void {
    this.uploadInput.emit({ type: 'cancel', id: id });
  }

  removeFile(id: string): void {
    this.uploadInput.emit({ type: 'remove', id: id });
  }

  removeAllFiles(): void {
    this.uploadInput.emit({ type: 'removeAll' });
  }

  // For the file drop package
  fileDropFn(event: NgxFileDropEntry[]) {
    var selectedFile = event[0].fileEntry
    // User didn't upload a directory
    if (selectedFile.isFile) {
      // have to convert it to an actual file entry 
      const fileEntry = selectedFile as FileSystemFileEntry;
      // this is truly ugly
      fileEntry.file((file: File) => {
        const formData = new FormData();
        formData.append('file', file, selectedFile.name);
        const upload$ = this.http.post(this.baseUrl + 'FileUpload', formData);
        upload$.subscribe(resp => {
          console.log(resp);
        });
      });
    }
  }
}
