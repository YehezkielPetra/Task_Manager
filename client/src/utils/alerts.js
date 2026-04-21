import Swal from 'sweetalert2';

export const toast = (icon, title) => {
  Swal.fire({
    icon,
    title,
    timer: 2000,
    showConfirmButton: false,
    toast: true,
    position: 'top-end',
    timerProgressBar: true,
  });
};

export const confirmDialog = (title, text, confirmText = 'Ya, Hapus!') => {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: confirmText
  });
};