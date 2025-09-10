
/* === Estilos CSS coherentes === */
const styles = `
:root{
  --bg:#f6f8fb;
  --card:#ffffff;
  --border:#e6e8ef;
  --muted:#6b7280;
  --text:#0f172a;
  --primary:#4f46e5;
  --primary-600:#5048f0;
  --warn:#f59e0b;
  --danger:#ef4444;
  --success:#16a34a;
}

*{box-sizing:border-box}
.container {
  padding: 1.5rem 2rem;
  background: var(--bg);
  min-height: 100vh;
  color: var(--text);
}
.header{display:flex;align-items:center;justify-content:space-between;gap:1rem;}
.title{margin:0;}
.subtitle{margin:.25rem 0 0;color:var(--muted);}
.muted{color:var(--muted);}

/* Toolbar */
.toolbar{display:flex;gap:.75rem;flex-wrap:wrap;margin-top:1rem;position:relative;z-index:10;}
.input{padding:.6rem .8rem;border:1px solid var(--border);border-radius:.6rem;background:#fff;color:var(--text);}
.input-sm{padding:.45rem .65rem; font-size:.9rem;}   /* inputs más compactos */
.btn-sm{padding:.35rem .6rem; font-size:.85rem;}
.input::placeholder{font-size:.9rem; color:var(--muted);}
select.input option{color:var(--text);background:#fff;}
.sorter{display:flex;gap:.5rem;align-items:center;}
.small-label{font-size:.9rem;}

/* Tabla */
.table-wrap{background:var(--card);border:1px solid var(--border);border-radius:1rem;margin-top:1rem;overflow:auto;box-shadow:0 6px 20px rgba(15,23,42,.06);position:relative;z-index:1;}
.table{width:100%;border-collapse:separate;border-spacing:0;}
.table thead th{position:sticky;top:0;background:#f9fafb;z-index:1;text-align:center;padding:.8rem;border-bottom:1px solid var(--border);}
.table td{padding:.8rem;text-align:center;border-bottom:1px solid var(--border);vertical-align:middle;}
.table tr:hover td{background:#fafafa;}
.table .left{text-align:left;}
.actions{white-space:nowrap;}

/* Botones de acciones en tabla: compactos y consistentes */
.table .actions .btn {
  padding: .55rem .85rem;
  font-size: .9rem;
  border-radius: .5rem;
  box-shadow: none;
  margin-right: .34rem;
}
.table .actions .btn:last-child {
  margin-right: 0;
}

/* Email en celda */
.table td.email-cell{ text-align:center; white-space:normal; }
.email-link{
  display:block;
  text-decoration:none;
  color:inherit;
  word-break:break-word;
  line-height:1.2;
}

/* Botones generales */
.btn{
  padding:.95rem 1.35rem;
  font-size:1.05rem;
  border-radius:.8rem;
  box-shadow:0 8px 20px rgba(79,70,229,.22);
}
.btn:disabled{opacity:.6;cursor:not-allowed;}
.btn:active{transform:translateY(1px);}
.btn-primary{background:var(--primary);color:#fff;}
.btn-primary:hover{background:var(--primary-600);}
.btn-warning{background:#f59e0b;color:#fff;}
.btn-danger{background:var(--danger);color:#fff;}
.btn-success{background:var(--success);color:#fff;}
.btn-secondary{background:#9ca3af;color:#fff;}
.btn-light{background:#eef0f5;}

/* Botones CTA (crear/registrar) */
.btn-cta{
  padding:.95rem 1.35rem;
  font-size:1.05rem;
  border-radius:.8rem;
  box-shadow:0 8px 20px rgba(79,70,229,.22);
}
.btn-cta:hover{transform:translateY(-1px);}
.btn-cta:active{transform:translateY(0);}

/* Modal */
.modal-overlay{position:fixed;inset:0;background:rgba(2,6,23,.6);display:flex;justify-content:center;align-items:center;z-index:1000;padding:1rem;}
.modal{background:var(--card);padding:1.25rem 1.25rem 1rem;border-radius:16px;width:520px;max-width:95%;border:1px solid var(--border);box-shadow:0 30px 80px rgba(2,6,23,.25);}
.modal-lg{width:720px;}
.modal-title{margin:0 0 1rem;}
.modal-actions{margin-top:1.2rem;display:flex;justify-content:flex-end;gap:.7rem;}

/* Form */
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;}
.form-grid label,.modal label{display:block;margin-bottom:.35rem;font-weight:600;color:var(--text);}
.form-grid input,.form-grid select,textarea{width:100%;padding:.6rem .8rem;border:1px solid var(--border);border-radius:.6rem;background:#fff;outline:none;color:var(--text);}
.form-grid input:focus,.form-grid select:focus,textarea:focus{border-color:var(--primary);box-shadow:0 0 0 3px rgba(79,70,229,.15);}
.form-grid input::placeholder,textarea::placeholder{color:var(--muted);opacity:1;}
.form-grid select option{color:var(--text);background:#fff;}
.form-grid input:-webkit-autofill,.form-grid select:-webkit-autofill,textarea:-webkit-autofill{-webkit-text-fill-color:var(--text);box-shadow:0 0 0px 1000px #fff inset;transition:background-color 9999s ease-in-out 0s;}
`;