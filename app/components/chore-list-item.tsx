import Link from "next/link";
import { type ReactNode, useMemo } from "react";

interface ChoreListItemProps {
  href: string;
  title: string;
  image: string;
  description: string;
  locationSuffixes: {
    single: string;
    plural: string;
  };
  peopleCount: number;
  anchor?: boolean;
}

interface Props {
  children: ReactNode;
}

export const ChoreListItem = ({
  description,
  href,
  locationSuffixes,
  peopleCount,
  title,
  image,
  anchor,
}: ChoreListItemProps) => {
  const locationSuffix =
    peopleCount > 1 ? locationSuffixes.plural : locationSuffixes.single;

  const Component = useMemo(
    () =>
      anchor
        ? ({ children }: Props) => (
            <a href={href} className="p-2">
              {children}
            </a>
          )
        : ({ children }: Props) => (
            <Link href={href} className="p-2">
              {children}
            </Link>
          ),
    [anchor, href],
  );

  return (
    <Component>
      <div className="rounded border-2 cursor-pointer bg-fuchsia-200 hover:bg-fuchsia-100 shadow w-full flex flex-row p-2 items-center">
        <div className="w-12 aspect-square mr-4">
          <img src={image} aria-hidden />
        </div>
        <div>
          <p className="font-bold">{title}</p>
          <p className="text-sm">{description}</p>
          <p className="text-xs">
            <span className="font-bold">{peopleCount}</span> {locationSuffix}
          </p>
        </div>
      </div>
    </Component>
  );
};
