// src/reportes/ShowReports.jsx
import { useEffect, useState } from "react";
import api, { API_PREFIX } from "../utils/api";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function ShowReports() {
  const [novedades, setNovedades] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Obtener novedades del backend
  const fetchNovedades = async () => {
    try {
      setLoading(true);
      const res = await api.get(`${API_PREFIX}/novedades`);

      // Normalizamos campos para el reporte
      const rows = (Array.isArray(res.data) ? res.data : []).map((n) => ({
        id: n.id,
        empleado:
          n.nombre_empleado ||
          n.empleado ||
          n.empleado_nombre ||
          n.nombreEmpleado ||
          "",
        tipo: n.tipo || "",
        descripcion: n.descripcion || "",
        fecha_inicio: n.fecha_inicio
          ? String(n.fecha_inicio).substring(0, 10)
          : "",
        fecha_fin: n.fecha_fin ? String(n.fecha_fin).substring(0, 10) : "—",
        estado: n.estado || "",
      }));

      setNovedades(rows);
      console.log("[Reportes] Novedades normalizadas:", rows);
    } catch (err) {
      console.error("Error cargando novedades:", err);
      toast.error(
        `❌ ${
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Error cargando novedades"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNovedades();
  }, []);

  // 🔹 Exportar a PDF
  const exportPDF = () => {
    if (novedades.length === 0) {
      toast.info("No hay datos para exportar.");
      return;
    }
    const doc = new jsPDF();
    doc.text("📑 Reporte de Novedades", 14, 15);
    doc.autoTable({
      startY: 20,
      head: [["ID", "Empleado", "Tipo", "Descripción", "Fecha Inicio", "Fecha Fin", "Estado"]],
      body: novedades.map((n) => [
        n.id,
        n.empleado,
        n.tipo,
        n.descripcion,
        n.fecha_inicio,
        n.fecha_fin,
        n.estado,
      ]),
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [79, 70, 229] },
    });
    doc.save("reporte_novedades.pdf");
  };

  // 🔹 Exportar a Excel
  const exportExcel = () => {
    if (novedades.length === 0) {
      toast.info("No hay datos para exportar.");
      return;
    }
    const ws = XLSX.utils.json_to_sheet(
      novedades.map((n) => ({
        ID: n.id,
        Empleado: n.empleado,
        Tipo: n.tipo,
        Descripción: n.descripcion,
        "Fecha Inicio": n.fecha_inicio,
        "Fecha Fin": n.fecha_fin,
        Estado: n.estado,
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Novedades");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(data, "reporte_novedades.xlsx");
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📑 Reporte de Novedades</h2>

      <div style={styles.actions}>
        <button style={styles.pdfBtn} onClick={exportPDF}>
          📄 Exportar PDF
        </button>
        <button style={styles.excelBtn} onClick={exportExcel}>
          📊 Exportar Excel
        </button>
      </div>

      {loading ? (
        <p>Cargando novedades...</p>
      ) : (
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Empleado</th>
              <th style={styles.th}>Tipo</th>
              <th style={styles.th}>Descripción</th>
              <th style={styles.th}>Fecha Inicio</th>
              <th style={styles.th}>Fecha Fin</th>
              <th style={styles.th}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {novedades.length > 0 ? (
              novedades.map((n) => (
                <tr key={n.id}>
                  <td style={styles.td}>{n.id}</td>
                  <td style={styles.td}>{n.empleado}</td>
                  <td style={styles.td}>{n.tipo}</td>
                  <td style={styles.td}>{n.descripcion}</td>
                  <td style={styles.td}>{n.fecha_inicio}</td>
                  <td style={styles.td}>{n.fecha_fin}</td>
                  <td style={styles.td}>{n.estado}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={styles.td}>
                  No hay novedades registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles = {
  container: { padding: "2rem", background: "#f4f6f9", minHeight: "100vh" },
  title: { textAlign: "center", marginBottom: "1.5rem", color: "#4b0082" },
  actions: {
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
    marginBottom: "1rem",
  },
  pdfBtn: {
    padding: "0.6rem 1rem",
    background: "#f44336",
    border: "none",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
  },
  excelBtn: {
    padding: "0.6rem 1rem",
    background: "#4caf50",
    border: "none",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
  },
  table: { width: "100%", borderCollapse: "collapse", background: "white" },
  thead: { background: "#f5f6ff" },
  th: { padding: "0.8rem", color: "#333", fontWeight: 600, textAlign: "center" },
  td: {
    padding: "0.8rem",
    borderBottom: "1px solid #eee",
    textAlign: "center",
    color: "#333",
  },
};
