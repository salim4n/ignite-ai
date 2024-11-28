"use client";
import Image from "next/image";

export default function Logo() {
	return (
		<Image
			src="/spidr_logo.svg"
			alt="logo"
			width={200}
			height={200}
			priority
			unoptimized
			onClick={() => {
				window.open("https://spidr.fr/", "_blank");
			}}
			className="transition-transform transform hover:scale-110 hover:brightness-125 hover:cursor-pointer"
		/>
	);
}
