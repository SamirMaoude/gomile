"use client";

import { useState } from "react";
import "./accordion.css";
import clsx from "clsx";
import Typography from "../typography";


interface AccordionItem {
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionItem[];
}

function ChevronIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function AccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: AccordionItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={clsx("item", isOpen ? "open" : "")}
      onClick={onToggle}
    >
      <div className="header">
        <Typography variant="h3" weight="semibold" Component="span" className={"question"}>{item.question}</Typography>
        <span className={clsx("chevron", isOpen ? "rotated" : "")}>
          <ChevronIcon />
        </span>
      </div>

      <div className={clsx("body", isOpen ? "open" : "")}>
        <Typography variant="p" className="answer">{item.answer}</Typography>
      </div>
    </div>
  );
}

export default function Accordion({ items }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={"wrapper"}>
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          item={item}
          isOpen={openIndex === index}
          onToggle={() => toggle(index)}
        />
      ))}
    </div>
  );
}