import Cookies from "js-cookie";
import { useCallback, useRef } from "react";
import Markdown from "react-markdown";
import { COOKIE_BULLETINS_DISMISSED } from "../constants";
import type { BulletinMessage as BulletinMessageData } from "../data/bulletin-board";

interface BulletinMessageProps {
  data: BulletinMessageData;
}

export const BulletinMessage = ({ data }: BulletinMessageProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const markAsDismissed = useCallback(() => {
    const existing = Cookies.get(COOKIE_BULLETINS_DISMISSED);
    const dismissedIds: string[] = [];
    const id = data._id!;
    const parent = document.getElementById("messages");
    const wrapper = document.getElementById("bulletin-board");

    if (existing) {
      dismissedIds.push(...existing.split("|"));
    }

    if (dismissedIds.includes(id)) {
      return;
    }

    dismissedIds.push(id);

    Cookies.set(COOKIE_BULLETINS_DISMISSED, dismissedIds.join("|"), {
      expires: 30,
    });

    if (ref.current) {
      ref.current.remove();
    }

    console.log(parent);

    if (parent?.children.length === 0) {
      wrapper?.remove();
    }
  }, [data]);

  return (
    <div
      className="border rounded p-2 bg-white flex justify-between"
      data-id="mkdown"
      ref={ref}
    >
      <div>
        <Markdown>{data.message}</Markdown>
      </div>
      {data.dismissible && (
        <div className="flex items-end">
          <button
            type="button"
            onClick={markAsDismissed}
            className="text-sm text-purple-600 px-2 py-1 border bg-purple-50 rounded cursor-pointer hover:underline"
          >
            Mark as Read
          </button>
        </div>
      )}
    </div>
  );
};
