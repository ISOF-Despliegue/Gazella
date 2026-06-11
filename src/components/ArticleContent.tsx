import type { OutputData } from "@editorjs/editorjs";
import { SafeImage } from "./SafeImage";

interface ArticleContentProps {
    content: OutputData;
}

type ListItem = string | {
    content?: string;
    items?: ListItem[];
};

function getListItemText(item: ListItem) {
    return typeof item === "string" ? item : item.content ?? "";
}

function getPlainText(value: unknown) {
    if (typeof value !== "string") return "";

    const document = new DOMParser().parseFromString(value, "text/html");
    return document.body.textContent ?? "";
}

export function ArticleContent({ content }: Readonly<ArticleContentProps>) {
    if (!content.blocks.length) {
        return <p className="text-sm text-gray-500">El artículo no tiene contenido.</p>;
    }

    return (
        <div className="space-y-5 text-base leading-7 text-gray-700">
            {content.blocks.map((block, index) => {
                const key = block.id ?? `${block.type}-${index}`;

                if (block.type === "header") {
                    const level = Number(block.data.level) || 2;
                    const className = "font-bold text-gray-900 " + (level <= 2 ? "text-2xl" : "text-xl");
                    return <h2 key={key} className={className}>{getPlainText(block.data.text)}</h2>;
                }

                if (block.type === "list") {
                    const items = (block.data.items ?? []) as ListItem[];
                    const ListTag = block.data.style === "ordered" ? "ol" : "ul";
                    return (
                        <ListTag key={key} className={ListTag === "ol" ? "list-decimal pl-6" : "list-disc pl-6"}>
                            {items.map((item, itemIndex) => (
                                <li key={`${key}-${itemIndex}`}>{getPlainText(getListItemText(item))}</li>
                            ))}
                        </ListTag>
                    );
                }

                if (block.type === "image" && block.data.file?.url) {
                    return (
                        <figure key={key} className="space-y-2">
                            <SafeImage
                                src={block.data.file.url}
                                alt={block.data.caption || "Imagen del artículo"}
                                className="max-h-[420px] w-full rounded-xl object-cover"
                            />
                            {block.data.caption && (
                                <figcaption className="text-center text-sm text-gray-500">{block.data.caption}</figcaption>
                            )}
                        </figure>
                    );
                }

                return <p key={key}>{getPlainText(block.data.text)}</p>;
            })}
        </div>
    );
}
