import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import { Subscription, finalize, forkJoin, map, tap } from 'rxjs';
import { ArquivoService } from '../../services/arquivo';
import { Arquivo } from '../../interfaces/arquivo';

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

  @Input() pedidoId!: number; 
  @Output() uploadCompleto = new EventEmitter<void>();

  arquivos: Arquivo[] = [];
  files: FileUploadState[] = [];
  isDragging = false;
  isUploading = false;

  arquivoEmEdicaoId: number | null = null;
  nomeEditado: string = '';

  constructor(private http: HttpClient, private arquivoService: ArquivoService) {
  }

  ngOnInit() {
    this.getArquivos();
    console.log(this.arquivos);
  }

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
    console.log("addFiles");
    newFiles.forEach(file => {
      if (!this.files.some(f => f.file.name === file.name)) {
        this.files.push({ file, status: 'pending', progress: 0 });
      }
    });
  }

  removeFile(fileName: string): void {
    this.files = this.files.filter(f => f.file.name !== fileName);
  }
  
  onUpload(): void {
    if (this.files.length === 0 || this.isUploading ) {
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
          this.getArquivos();
          this.files = [];
        })
      )
      .subscribe();
  }

  private uploadFile(fileState: FileUploadState) {
    fileState.status = 'uploading';
    return this.arquivoService.uploadArquivoDoPedido(this.pedidoId, fileState.file).pipe(
      tap(event => {
        if (event.type === HttpEventType.UploadProgress) {
          fileState.progress = Math.round(100 * (event.loaded / (event.total || 1)));
        } else if (event instanceof HttpResponse) {
          fileState.status = 'success';
          fileState.progress = 100;
        }
      }),
      map(() => true),
      finalize(() => {
        if (fileState.status !== 'success') {
          fileState.status = 'error';
        }
      })
    );
  }

  baixarArquivo(arquivo: any) {
    const link = document.createElement('a');
    link.href = arquivo.file; // Adicione esta linha
    link.download = arquivo.file_name || 'arquivo';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  removerArquivoSalvo(arquivo: Arquivo): void {
    if (!window.confirm(`Tem certeza que deseja remover o arquivo "${arquivo.file_name}"?`)) {
      return;
    }

    this.arquivoService.removerArquivo(arquivo.id).subscribe({
      next: () => {
        this.arquivos = this.arquivos.filter(a => a.id !== arquivo.id);
      },
      error: (err) => {
        console.error('Erro ao remover arquivo:', err);
      }
    });
  }

  getArquivos() {
      this.arquivoService.getArquivosDoPedido(this.pedidoId).subscribe({
        next: (arquivos) => {
          this.arquivos = arquivos;
          console.log('Arquivos carregados:', this.arquivos);
        },
        error: (err) => {
          console.error('Erro ao buscar arquivos:', err);
        }
      });
  }

  cancelar() {
    this.files = [];
  }

}