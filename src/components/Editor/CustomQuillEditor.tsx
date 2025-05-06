import { useMemo } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill");
    const { default: Quill } = await import("quill");

    // Configurar las fuentes personalizadas
    const Font = Quill.import("formats/font");
    Font.whitelist = ["bevietnam", "joly"];
    Quill.register(Font, true);

    return RQ;
  },
  { ssr: false }
);

interface CustomQuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

// Agregar estilos globales para la vista previa
const previewStyles = `
  .ql-font-bevietnam {
    font-family: var(--font-bevietnam) !important;
  }
  .ql-font-joly {
    font-family: var(--font-joly) !important;
  }
`;

export default function CustomQuillEditor({
  value,
  onChange,
  className,
}: CustomQuillEditorProps) {
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ font: ["bevietnam", "joly"] }],
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline"],
          [{ color: [] }],
          [{ align: [] }],
          ["link"],
        ],
      },
    }),
    []
  );

  const formats = [
    "font",
    "header",
    "bold",
    "italic",
    "underline",
    "color",
    "align",
    "link",
  ];

  // Agregar estilos para la vista previa
  useMemo(() => {
    if (typeof window !== "undefined") {
      const style = document.createElement("style");
      style.innerHTML = previewStyles;
      document.head.appendChild(style);
      return () => document.head.removeChild(style);
    }
  }, []);

  return (
    <>
      <style jsx global>{`
        /* Estilos base del editor */
        .ql-editor {
          font-family: var(--font-bevietnam);
        }

        /* Estilos para las fuentes en el selector */
        .ql-font-bevietnam {
          font-family: var(--font-bevietnam) !important;
        }
        .ql-font-joly {
          font-family: var(--font-joly) !important;
        }

        /* Nombres en el selector de fuentes */
        .ql-snow
          .ql-picker.ql-font
          .ql-picker-label[data-value="bevietnam"]::before,
        .ql-snow
          .ql-picker.ql-font
          .ql-picker-item[data-value="bevietnam"]::before {
          content: "Be Vietnam Pro" !important;
          font-family: var(--font-bevietnam);
        }

        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="joly"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="joly"]::before {
          content: "Joly Display" !important;
          font-family: var(--font-joly);
        }
      `}</style>
      <ReactQuill
        theme="snow"
        modules={modules}
        formats={formats}
        value={value}
        onChange={onChange}
        className={className}
      />
    </>
  );
}
