import { useMemo } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import type { ReactQuillProps } from "react-quill";

// Definimos el tipo para nuestro componente dinámico
const QuillNoSSRWrapper = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill");
    const { default: Quill } = await import("quill");

    // Configurar las fuentes personalizadas
    const Font = Quill.import("formats/font");
    Font.whitelist = ["bevietnam", "joly", "sans-serif", "serif", "monospace"];
    Quill.register(Font, true);

    // Agregar los selectores de fuentes
    const icons = Quill.import("ui/icons");
    icons["bevietnam"] = "Be Vietnam Pro";
    icons["joly"] = "Joly Display";

    return function Component(props: ReactQuillProps) {
      return <RQ {...props} />;
    };
  },
  { ssr: false }
);

interface CustomQuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function CustomQuillEditor({
  value,
  onChange,
  className,
}: CustomQuillEditorProps) {
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [
            {
              font: ["bevietnam", "joly", "sans-serif", "serif", "monospace"],
            },
          ],
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ align: [] }],
          ["link", "image", "clean"],
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
    "strike",
    "color",
    "background",
    "list",
    "bullet",
    "align",
    "link",
    "image",
  ];

  return (
    <>
      <style jsx global>{`
        .ql-editor {
          font-family: var(--font-bevietnam);
        }

        /* Estilos para el selector de fuentes */
        .ql-snow .ql-picker.ql-font {
          font-family: var(--font-bevietnam);
        }

        /* Estilos para las opciones del selector */
        .ql-snow .ql-picker.ql-font .ql-picker-label::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item::before {
          content: attr(data-value) !important;
        }

        /* Estilos específicos para cada fuente en el selector */
        .ql-font-bevietnam,
        .ql-snow
          .ql-picker.ql-font
          .ql-picker-label[data-value="bevietnam"]::before,
        .ql-snow
          .ql-picker.ql-font
          .ql-picker-item[data-value="bevietnam"]::before {
          font-family: var(--font-bevietnam) !important;
          content: "Be Vietnam Pro" !important;
        }

        .ql-font-joly,
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="joly"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="joly"]::before {
          font-family: var(--font-joly) !important;
          content: "Joly Display" !important;
        }

        /* Estilos para los encabezados */
        .ql-editor h1,
        .ql-editor h2,
        .ql-editor h3 {
          font-family: var(--font-bevietnam);
          color: #1f2937;
        }

        /* Estilos para el texto con cada fuente */
        .ql-font-bevietnam {
          font-family: var(--font-bevietnam) !important;
        }
        .ql-font-joly {
          font-family: var(--font-joly) !important;
        }
        .ql-font-serif {
          font-family: serif !important;
        }
        .ql-font-sans-serif {
          font-family: sans-serif !important;
        }
        .ql-font-monospace {
          font-family: monospace !important;
        }
      `}</style>
      <QuillNoSSRWrapper
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
