"use client";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Logo() {
	return (
		<motion.div
			initial={{ scale: 1, y: 0 }} // État initial
			animate={{ scale: 1.1, y: -5 }} // État animé
			transition={{
				duration: 0.5,
				yoyo: Infinity, // Répéter l'animation
				ease: "easeInOut", // Type d'animation
			}}
			className="transition-transform transform hover:scale-110 hover:brightness-125 hover:cursor-pointer">
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
		</motion.div>
	);
}
