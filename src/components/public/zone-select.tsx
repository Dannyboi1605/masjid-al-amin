import { zonesByState, zoneLabel } from "@/lib/prayer/zones";

type Props = {
  id: string;
  name: string;
  defaultValue?: string;
  className?: string;
};

export function ZoneSelect({ id, name, defaultValue, className }: Props) {
  return (
    <select
      id={id}
      name={name}
      defaultValue={defaultValue}
      className={className}
    >
      {zonesByState.map((group) => (
        <optgroup key={group.state} label={group.state}>
          {group.zones.map((zone) => (
            <option key={zone.code} value={zone.code}>
              {zoneLabel(zone)}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
