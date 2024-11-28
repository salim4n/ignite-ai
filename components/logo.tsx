"use client";
import Image from "next/image";

export default function Logo() {
	return (
		<Image
			src="/flame.gif"
			alt="logo"
			width={100}
			height={100}
			priority
			unoptimized
			onClick={() => {
				window.open("https://ignitionai.fr/", "_blank");
			}}
			className="transition-transform transform hover:scale-110 hover:brightness-125 hover:cursor-pointer"
		/>
	);
}
