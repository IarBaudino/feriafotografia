import { useMemo } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill");
    const { default: Quill } = await import("quill");

    const Font = Quill.import("formats/font");
    Font.whitelist = ["bevietnam"];
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

const previewStyles = `
  .ql-font-bevietnam {
    font-family: var(--font-bevietnam) !important;
  }
  .ql-font-joly {
    font-family: var(--font-bevietnam) !important;
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
    "header",
    "bold",
    "italic",
    "underline",
    "color",
    "align",
    "link",
  ];

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
        .ql-editor {
          font-family: var(--font-bevietnam);
        }

        .ql-font-bevietnam {
          font-family: var(--font-bevietnam) !important;
        }

        .ql-font-joly {
          font-family: var(--font-bevietnam) !important;
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
