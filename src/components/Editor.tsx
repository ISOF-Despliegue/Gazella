import { useEffect, useRef } from "react";
import EditorJS, { type OutputData, type ToolConstructable } from "@editorjs/editorjs";
import Header from "@editorjs/header";
import Paragraph from "@editorjs/paragraph";
import List from "@editorjs/list";
import Underline from "@editorjs/underline";
import ImageTool from "@editorjs/image";
// @ts-ignore
import AlignmentTuneTool from "editorjs-text-alignment-blocktune";

interface EditorProps {
  initialData?: OutputData;
  onChange: (data: OutputData) => void;
}

export const Editor = ({ initialData, onChange }: EditorProps) => {
  // Reference for maintaining the EditorJS instance and avoiding duplicates in re-renders
  const editorInstance = useRef<EditorJS | null>(null);

  useEffect(() => {
    if (!editorInstance.current) {
      const editor = new EditorJS({
        holder: "editorjs-container",
        data: initialData,
        placeholder: "Comienza a escribir tu artículo aquí...",

        tunes: ['alignmentTune'],

        tools: {
            alignmentTune: {
                class: AlignmentTuneTool,
                config: {
                    default: "left",
                    blocks: {
                    header: 'left',
                    list: 'left'
                }
                },
            },
            paragraph: {
                class: Paragraph as unknown as ToolConstructable,
                inlineToolbar: true,
                tunes: ['alignmentTune'],
            },
            
            header: {
                class: Header,
                inlineToolbar: ['link', 'underline'],
                tunes: ['alignmentTune'],
                config: {
                placeholder: 'Escribe un encabezado...',
                levels: [2, 3, 4],
                defaultLevel: 2
                }
            },
            
            list: {
                class: List,
                inlineToolbar: ['link', 'underline', 'bold', 'italic'],
                config: {
                defaultStyle: 'unordered'
                }
            },
            
            underline: {
                class: Underline,
                shortcut: 'CMD+U',
            },
            
            image: {
                class: ImageTool,
                config: {
                uploader: {
                    // Esta función intercepta la imagen antes de insertarla
                    async uploadByFile(file: File) {
                    try {
                        // AQUÍ VA LA LÓGICA DE TU BUCKET EN GAZELLA
                        // Ejemplo conceptual:
                        // const formData = new FormData();
                        // formData.append('image', file);
                        // const response = await api.post('/media/upload', formData);
                        // const bucketUrl = response.data.url;

                        // Simularemos una subida exitosa para propósitos de desarrollo inicial
                        console.log('Subiendo archivo al bucket...', file.name);
                        const mockBucketUrl = URL.createObjectURL(file); // Quitar en producción

                        return {
                        success: 1,
                        file: {
                            url: mockBucketUrl,
                            // url: bucketUrl // (Usar esto en producción)
                        }
                        };
                    } catch (error) {
                        console.error('Error subiendo la imagen:', error);
                        return {
                        success: 0,
                        message: 'Error al subir la imagen al servidor'
                        };
                    }
                    }
                }
                }
            }
        },

        onChange: async () => {
          try {
            const content = await editor.save();
            onChange(content);
          } catch (error) {
            console.error('Error al guardar los datos de EditorJS:', error);
          }
        },
      });

      editorInstance.current = editor;
    }

    return () => {
      if (editorInstance.current?.destroy) {
        editorInstance.current.destroy();
        editorInstance.current = null;
      }
    };
  }, []); // The empty array ensures that this only executes when the component is mounted.

  return (
    <div 
        id="editorjs-container"
        className="prose max-w-none w-full min-h-[550px] text-gray-900 focus:outline-none"
    />
  );
};