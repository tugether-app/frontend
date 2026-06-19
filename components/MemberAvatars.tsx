import type { Member } from "@/lib/types";
import { Avatar } from "./Avatar";

// Overlapping avatars: visual proof of "we are in this together".

export function MemberAvatars({
  members,
  max = 4,
  size = 40,
}: {
  members: Member[];
  max?: number;
  size?: number;
}) {
  const shown = members.slice(0, max);
  const extra = members.length - shown.length;

  return (
    <div className="flex items-center">
      {shown.map((m, i) => (
        <div
          key={m.id}
          title={m.displayName}
          className="rounded-full ring-[3px] ring-surface"
          style={{ marginLeft: i === 0 ? 0 : -14, zIndex: shown.length - i }}
        >
          <Avatar seed={m.avatarSeed} size={size} />
        </div>
      ))}
      {extra > 0 && (
        <span
          className="inline-flex items-center justify-center rounded-full bg-gold-soft font-display font-bold text-gold-deep ring-[3px] ring-surface"
          style={{ width: size, height: size, fontSize: size * 0.32, marginLeft: -14 }}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}
