"use client";
import Image from "next/image";

export default function Logo() {
	return (
		<Image
			src="/flame.gif"
			alt="logo"
			width={38}
			height={38}
			priority
			unoptimized
			onClick={() => {
				window.open("https://ignitionai-note.vercel.app/", "_blank");
			}}
			className="transition-transform transform hover:scale-110 hover:brightness-125 hover:cursor-pointer"
		/>
	);
}
