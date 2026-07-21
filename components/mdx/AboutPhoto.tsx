import Image from "next/image";

export default function AboutPhoto() {
  return (
    <figure className="my-8 overflow-hidden rounded-lg border border-border">
      <Image
        src="/images/leslie-speaking.png"
        alt="Leslie Johnson speaking at an event."
        width={2548}
        height={1458}
        className="w-full h-auto"
        priority
      />
    </figure>
  );
}
