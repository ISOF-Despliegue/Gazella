import { useMemo, type JSX } from 'react';
import type { OutputData } from "@editorjs/editorjs";
import { SafeImage } from "./SafeImage";

interface ArticleContentProps {
    content: string | OutputData;
    className?: string;
}

type ListItem = string | {
    content?: string;
    items?: ListItem[];
};

export function ArticleContent({ content, className = "" }: Readonly<ArticleContentProps>) {
    const parsedContent = useMemo<OutputData | null>(() => {
        if (!content) {
            return null;
        }
        if (typeof content === "object") {
            return content;
        }
        try {
            return JSON.parse(content) as OutputData;
        } catch (error) {
            console.error("Failed to parse EditorJS content at ArticleContent: ", error);
            return null;
        }
    }, [content]);

    if (!parsedContent?.blocks || parsedContent.blocks.length === 0) {
        return <p className="text-sm text-gray-400 italic">El artículo no tiene contenido.</p>;
    }

    const getAlignmentClass = (block: any) => {
        const alignment = block.tunes?.alignmentTune?.alignment;
        switch (alignment) {
            case 'center': {
                return 'text-center';
            }
            case 'right': {
                return 'text-right';
            }
            case 'justify': {
                return 'text-justify';
            }
            default: return 'text-left';
        }
    };

    const renderListItem = (item: ListItem, index: number, keyPrefix: string): React.ReactNode => {
        if (typeof item === 'string') {
            return <li key={`${keyPrefix}-${index}`} dangerouslySetInnerHTML={{ __html: item }} />;
        }
        return (
            <li key={`${keyPrefix}-${index}`}>
                {item.content && <span dangerouslySetInnerHTML={{ __html: item.content }} />}
                {item.items && item.items.length > 0 && (
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                        {item.items.map((subItem, subIndex) => renderListItem(subItem, subIndex, `${keyPrefix}-${index}`))}
                    </ul>
                )}
            </li>
        );
    };

    return (
        /* 
        * We use the 'prose' class from @tailwindcss/typography to provide consistent typographic styles.
        * `max-w-none` prevents the plugin from limiting the width, allowing the container
        * calling this component to decide the ideal width (e.g., smaller if it's a sidebar widget).
        */
        <div className={`prose max-w-none w-full text-gray-800 leading-relaxed ${className}`}>
            {parsedContent.blocks.map((block, index) => {
                const key = block.id ?? `${block.type}-${index}`;
                const alignmentClass = getAlignmentClass(block);

                switch (block.type) {
                    case "paragraph":
                        return (
                            <p 
                                key={key} 
                                className={`${alignmentClass} my-4 break-words`}
                                dangerouslySetInnerHTML={{ __html: block.data.text }} 
                            />
                        );

                    case "header": {
                        const level = Number(block.data.level) || 2;
                        const Tag = `h${level}` as keyof JSX.IntrinsicElements;
                        
                        let headingStyle = "text-2xl font-bold mt-6 mb-3 text-gray-900";
                        if (level === 3) {
                            headingStyle = "text-xl font-bold mt-5 mb-2 text-gray-900";
                        }
                        if (level === 4) {
                            headingStyle = "text-lg font-bold mt-4 mb-2 text-gray-900";
                        }

                        return (
                            <Tag 
                                key={key} 
                                className={`${headingStyle} ${alignmentClass}`}
                                dangerouslySetInnerHTML={{ __html: block.data.text }}
                            />
                        );
                    }

                    case "list": {
                        const items = (block.data.items ?? []) as ListItem[];
                        const ListTag = block.data.style === "ordered" ? "ol" : "ul";
                        const listClass = block.data.style === "ordered" 
                            ? "list-decimal pl-6 my-4 space-y-1" 
                            : "list-disc pl-6 my-4 space-y-1";

                        return (
                            <ListTag key={key} className={`${listClass} ${alignmentClass}`}>
                                {items.map((item, itemIndex) => renderListItem(item, itemIndex, key))}
                            </ListTag>
                        );
                    }

                    case "image": {
                        const imageUrl = block.data.file?.url;
                        if (!imageUrl) {
                            return null;
                        }

                        return (
                            <figure key={key} className="my-6 flex flex-col items-center space-y-2">
                                <SafeImage
                                    src={imageUrl}
                                    alt={block.data.caption || "Imagen del artículo"}
                                    className="max-h-[450px] w-full rounded-xl object-cover shadow-xs"
                                />
                                {block.data.caption && (
                                    <figcaption className="text-center text-sm text-gray-500 italic mt-2">
                                        {block.data.caption}
                                    </figcaption>
                                )}
                            </figure>
                        );
                    }

                    // Fallback block for unknown / future blocks
                    default:
                        if (block.data?.text) {
                            return (
                                <p 
                                    key={key} 
                                    className={alignmentClass}
                                    dangerouslySetInnerHTML={{ __html: block.data.text }} 
                                />
                            );
                        }
                        return null;
                }
            })}
        </div>
    );
}
