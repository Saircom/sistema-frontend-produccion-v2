// src/utils/notifications.js
import Swal from "sweetalert2";

export const notify = {
  success: (title, text = "") => {
    return Swal.fire({
      icon: "success",
      title,
      text,
      timer: 2000,
      showConfirmButton: false,
      background: "#ffffff",
      customClass: { popup: "rounded-3xl" },
    });
  },
  error: (title, text = "") => {
    return Swal.fire({
      icon: "error",
      title,
      text,
      confirmButtonColor: "#6366f1",
      customClass: { popup: "rounded-3xl", confirmButton: "rounded-xl px-6" },
    });
  },
  warn: (title, text = "") => {
    return Swal.fire({
      icon: "warning",
      title,
      text,
      confirmButtonColor: "#f59e0b",
    });
  },
  confirm: async (title, text = "") => {
    const result = await Swal.fire({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#94a3b8",
      customClass: { popup: "rounded-3xl", confirmButton: "rounded-xl", cancelButton: "rounded-xl" },
    });
    return result.isConfirmed;
  },
};