import { Menu } from "lucide-react";
import { useState } from "react";
import { BLOCK_DEFINITIONS } from "../../data/blockDefinitions";
import type { BlockSize, BlockType } from "../../types/block";
import { useDocument } from "../../context/DocumentContext";

export default function Sidebar() {
  const { addBlock } = useDocument();
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-base-300 rounded-box w-52 shadow-lg overflow-hidden max-h-[calc(100vh-5rem)] flex flex-col">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center p-3 w-full cursor-pointer shrink-0"
      >
        <Menu size={24} className="mr-5" />
        <span className="font-bold text-xl">블록</span>
      </button>

      <div className={`transition-all duration-300 ease-in-out flex-1 min-h-0 ${open ? "flex flex-col" : "hidden"}`}>
        <div
          className="overflow-y-auto h-full"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "oklch(var(--bc) / 0.2) transparent",
          }}
        >
          <ul className="menu w-full">
            {BLOCK_DEFINITIONS.map((block) => (
              <div key={block.type} className="border-t border-base-content/10 pb-3">
                <h2 className="menu-title">{block.label}</h2>
                <ul>
                  {block.allowedSizes.map((size) => (
                    <li key={size}>
                      <button
                        className="bg-base-100 mb-2"
                        onClick={() => addBlock(block.type as BlockType, size as BlockSize)}
                      >
                        <block.icon size={16} />
                        {size}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}