import type { Member } from "@/lib/types";
import { avatarColor, initials } from "@/lib/format";

// Overlapping circle avatars: visual proof of "we are in this together".

export function MemberAvatars({
  members,
  max = 5,
  size = 36,
}: {
  members: Member[];
  max?: number;
  size?: number;
}) {
  const shown = members.slice(0, max);
  const extra = members.length - shown.length;

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {shown.map((m) => (
          <span
            key={m.id}
            title={m.displayName}
            className="inline-flex items-center justify-center rounded-full font-bold text-white ring-2 ring-surface"
            style={{
              width: size,
              height: size,
              fontSize: size * 0.36,
              background: avatarColor(m.avatarSeed),
            }}
          >
            {initials(m.displayName)}
          </span>
        ))}
        {extra > 0 && (
          <span
            className="inline-flex items-center justify-center rounded-full bg-gold-soft font-bold text-gold-deep ring-2 ring-surface"
            style={{ width: size, height: size, fontSize: size * 0.34 }}
          >
            +{extra}
          </span>
        )}
      </div>
    </div>
  );
}
