import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import { Subscription, finalize, forkJoin, map, tap } from 'rxjs';

// Interface para gerenciar o estado de cada arquivo
export interface FileUploadState {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  subscription?: Subscription;
}

@Component({
  selector: 'app-pedido-file-upload',
  standalone: true, // Melhor prática para componentes reutilizáveis
  imports: [CommonModule],
  templateUrl: './pedido-file-upload.html',
  styleUrl: './pedido-file-upload.scss'
})
export class PedidoFileUpload {
  // Recebe o ID do item ao qual os arquivos pertencem
  @Input() itemId!: number; 
  // Emite um evento quando todos os uploads terminam
  @Output() uploadCompleto = new EventEmitter<void>();

  files: FileUploadState[] = [];
  isDragging = false;
  isUploading = false;

  // Injete o HttpClient para fazer as requisições
  constructor(private http: HttpClient) {}

  // --- Manipuladores de Eventos de UI ---

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    const files = event.dataTransfer?.files;
    if (files) {
      this.addFiles(Array.from(files));
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addFiles(Array.from(input.files));
    }
  }

  addFiles(newFiles: File[]): void {
    newFiles.forEach(file => {
      // Evita adicionar arquivos duplicados
      if (!this.files.some(f => f.file.name === file.name)) {
        this.files.push({ file, status: 'pending', progress: 0 });
      }
    });
  }

  removeFile(fileName: string): void {
    this.files = this.files.filter(f => f.file.name !== fileName);
  }

  // --- Lógica de Upload ---

  onUpload(): void {
    if (this.files.length === 0 || this.isUploading) {
      return;
    }

    this.isUploading = true;
    const uploadObservables = this.files
      .filter(f => f.status === 'pending')
      .map(fileState => this.uploadFile(fileState));

    forkJoin(uploadObservables)
      .pipe(
        finalize(() => {
          this.isUploading = false;
          this.uploadCompleto.emit();
        })
      )
      .subscribe();
  }

  private uploadFile(fileState: FileUploadState) {
    const formData = new FormData();
    formData.append('file', fileState.file, fileState.file.name);
    formData.append('item_id', this.itemId.toString()); // Envia o ID do item junto

    // Substitua pela URL da sua API
    const uploadUrl = `/api/itens/${this.itemId}/upload/`; 

    fileState.status = 'uploading';

    return this.http.post(uploadUrl, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      tap(event => {
        if (event.type === HttpEventType.UploadProgress) {
          fileState.progress = Math.round(100 * (event.loaded / (event.total || 1)));
        } else if (event instanceof HttpResponse) {
          fileState.status = 'success';
          fileState.progress = 100;
        }
      }),
      map(() => true), // Transforma o resultado para o forkJoin
      finalize(() => {
        // Garante que o status seja de erro se a subscrição for completada sem sucesso
        if (fileState.status !== 'success') {
          fileState.status = 'error';
        }
      })
    );
  }
}