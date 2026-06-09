import { Menu } from "lucide-react";
import { useState } from "react";
import { BLOCK_DEFINITIONS } from "../../data/blockDefinitions";
import type { BlockSize, BlockType } from "../../types/block";
import { useDocument } from "../../context/DocumentContext";

/**
 * Sidebar (블록 추가 패널)
 * - 사용 가능한 모든 블록 종류(BLOCK_DEFINITIONS)를 목록으로 보여줌
 * - 각 블록의 허용 크기(allowedSizes) 버튼을 눌러 해당 크기의 블록을 캔버스에 추가
 * - 헤더를 눌러 패널을 접고 펼 수 있음
 */
export default function Sidebar() {
  const { addBlock } = useDocument();
  const [open, setOpen] = useState(true);   // 패널 펼침/접힘 상태

  return (
    <div className="bg-base-300 rounded-box w-52 shadow-lg overflow-hidden max-h-[calc(100vh-5rem)] flex flex-col">
      {/* 헤더 클릭 → 패널 토글 */}
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
          {/* 블록 종류별로 그룹을 만들고, 그 안에 허용 크기 버튼들을 나열 */}
          <ul className="menu w-full">
            {BLOCK_DEFINITIONS.map((block) => (
              <div key={block.type} className="border-t border-base-content/10 pb-3">
                <h2 className="menu-title">{block.label}</h2>
                <ul>
                  {block.allowedSizes.map((size) => (
                    <li key={size}>
                      {/* 클릭 시 해당 타입/크기의 블록을 캔버스 빈 자리에 추가 */}
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