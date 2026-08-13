import { Component, ElementRef, input, output, viewChild } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  imports: [],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialog {
  message = input('¿Estás seguro? Esta acción no se puede deshacer.');
  confirmed = output<void>();
  cancelled = output<void>();

  private dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  open(): void {
    this.dialogRef().nativeElement.showModal();
  }

  onConfirm(): void {
    this.dialogRef().nativeElement.close();
    this.confirmed.emit();
  }

  onCancel(): void {
    this.dialogRef().nativeElement.close();
    this.cancelled.emit();
  }
}
