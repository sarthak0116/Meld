export default function ScrollIndicator() {
  return (
    <div className="flex flex-col items-center justify-end gap-2.5 pb-3 z-20">
      <div className="relative h-9 w-px overflow-hidden bg-[#0b0c0b]/20">
        <div
          className="absolute left-0 top-0 h-4 w-full bg-[#0b0c0b]"
          style={{ animation: "scrollDown 2s infinite ease-in-out" }}
        />
      </div>
    </div>
  );
}
