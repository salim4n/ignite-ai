"use client";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { useEffect, useState } from "react";
import { Bot, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import Logo from "@/components/logo";
import { rubbenPrompt } from "@/lib/prompt";

type Message = {
	content: string;
	isUser: boolean;
};

export default function Home() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [inputMessage, setInputMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [password, setPassword] = useState("");
	const [isSalim, setIsSalim] = useState(false);
	const [nbEssais, setNbEssais] = useState(0);
	const [postType, setPostType] = useState<"TOFU" | "MOFU" | "BOFU">("TOFU");

	const mdp = process.env.NEXT_PUBLIC_MDP;

	const llm = new ChatOpenAI({
		model: "gpt-4o",
		temperature: 0.7,
		apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, // Sécurisez votre clé API
	});

	const postCSVLink =
		"https://huggingface.co/datasets/IgnitionAI/growth-post/resolve/main/671fbf031eb34_posts.csv";
	const accrocheTextLink =
		"https://huggingface.co/datasets/IgnitionAI/growth-post/resolve/main/accroche.txt";

	const generateLinkedInPosts = async () => {
		try {
			// Charger les fichiers
			const csvResponse = await fetch(postCSVLink);
			const csvData = await csvResponse.text();
			// take only 30 rows randomly
			const filteredCSV = csvData.split("\n").slice(0, 30);

			const accrocheResponse = await fetch(accrocheTextLink);
			const accrocheText = await accrocheResponse.text();

			// Créer un prompt pour générer des posts LinkedIn
			const prompt = ChatPromptTemplate.fromTemplate(
				" {rubbenPrompt}, pour faire un post LinkedIn sur le sujet : {subject}, fait une accroche percutante : {accroche}, un post de type : {type}, et utilise le formatage MARKDOWN",
			);

			// Créer la chaîne de génération de texte
			const chain = prompt.pipe(llm);

			// Générer les posts
			const response: any = await chain.invoke({
				rubbenPrompt: rubbenPrompt,
				subject: inputMessage,
				accroche: accrocheText,
				type: postType,
			});

			// Retourner les posts générés
			return response.content;
		} catch (error) {
			console.error("Erreur lors de la génération des posts :", error);
			return "Une erreur s'est produite lors de la génération des posts.";
		}
	};

	// Méthode pour afficher les posts générés
	const handleGenerateLinkedInPosts = async () => {
		setIsLoading(true);
		if (!isSalim && nbEssais === 0) {
			alert("Vous avez déjà utilisé 3 essais gratuits");
			sessionStorage.setItem("growth-app-session", "done");
			return;
		}

		if (!isSalim) {
			setNbEssais(nbEssais - 1);
		}

		const posts = await generateLinkedInPosts();

		const newAIMessage = {
			content: posts as string,
			isUser: false,
		};

		// Mettre à jour les messages (assumant que vous avez toujours le state messages et setMessages)
		setMessages((prevMessages) => [...prevMessages, newAIMessage]);
		setIsLoading(false);
	};

	useEffect(() => {
		const session = window.sessionStorage.getItem("growth-app-session");
		if (session === mdp) {
			setIsLoggedIn(true);
		} else if (nbEssais !== 0) {
			setIsLoggedIn(true);
		} else {
			setIsLoggedIn(false);
		}
	}, [mdp, nbEssais, isLoggedIn]);

	useEffect(() => {
		if (nbEssais === 0) {
			sessionStorage.setItem("growth-app-session", "done");
		}
	}, [nbEssais]);

	useEffect(() => {
		if (!isSalim) {
			const isDone = sessionStorage.getItem("growth-app-session");
			const fromLocalStorage = localStorage.getItem("growth-app-session");
			if (isDone === "done" || fromLocalStorage === "done") {
				setIsLoggedIn(false);
			}
		}
	}, [isSalim]);

	async function login(password: string) {
		if (password === mdp) {
			window.sessionStorage.setItem("growth-app-session", password);
			setIsLoggedIn(true);
			setIsSalim(true);
		} else {
			setIsSalim(false);
			alert("Mot de passe incorrect");
		}
	}

	function isDisabled() {
		if (isSalim) {
			return false;
		} else if (nbEssais === 0) {
			return true;
		} else {
			return false;
		}
	}

	return isLoggedIn ? (
		<div className="flex flex-col h-[600px] max-w-2xl mx-auto border rounded-lg overflow-hidden">
			<div className="bg-primary p-4">
				<h2 className="text-2xl font-bold text-primary-foreground flex items-center">
					<Logo />
					Linkedin Post APP By AI- {isSalim ? "Salim" : " Invité"}
				</h2>
				{!isSalim && (
					<div className="flex justify-center">
						<div className="max-w-[80%] p-3 rounded-lg bg-secondary text-secondary-foreground">
							<p>Vous avez {nbEssais} essais gratuits restants</p>
						</div>
					</div>
				)}
			</div>
			<ScrollArea className="flex-grow p-4 space-y-4 items-center">
				{messages.map((message, index) => (
					<div
						key={index}
						className={`flex ${
							message.isUser ? "justify-end" : "justify-start"
						}`}>
						<div
							className={`max-w-[80%] p-3 rounded-lg ${
								message.isUser
									? "bg-primary text-primary-foreground"
									: "bg-secondary text-secondary-foreground"
							}`}>
							{!message.isUser && <Bot className="inline-block mr-2 h-4 w-4" />}
							<ReactMarkdown>{message.content}</ReactMarkdown>
						</div>
					</div>
				))}
				{isLoading && (
					<div className="flex justify-start">
						<div className="max-w-[80%] p-3 rounded-lg bg-secondary text-secondary-foreground">
							<Bot className="inline-block mr-2 h-4 w-4" />
							Je suis en train de créer vos post LinkedIn... 🤔
						</div>
					</div>
				)}
			</ScrollArea>
			<div className="p-4 border-t">
				<form
					onSubmit={(e) => {
						e.preventDefault();
						handleGenerateLinkedInPosts();
					}}
					className="flex space-x-2">
					<Input
						type="text"
						placeholder="Type your message..."
						value={inputMessage}
						onChange={(e) => setInputMessage(e.target.value)}
					/>
					<select
						value={postType}
						onChange={(e) => setPostType(e.target.value as any)}
						className="bg-transparent text-sm text-blue-700 hover:text-blue-800 focus:outline-none focus:ring-0 focus:ring-offset-0 focus:ring-offset-gray-800 font-medium hover:cursor-pointer">
						<option value="TOFU">TOFU</option>
						<option value="MOFU">MOFU</option>
						<option value="BOFU">BOFU</option>
					</select>
					<Button type="submit" disabled={isDisabled()}>
						<Send className="h-4 w-4" />
						<span className="sr-only">Send</span>
					</Button>
				</form>
			</div>
		</div>
	) : (
		<div className="flex flex-col h-[600px] max-w-2xl mx-auto border rounded-lg overflow-hidden">
			<div className="bg-primary p-4">
				<h2 className="text-2xl font-bold text-primary-foreground flex items-center">
					<Logo />
					Linkedin Post APP By AI- {isSalim ? "Salim" : " Invité"}
				</h2>
			</div>
			<div className="flex justify-center">
				<div className="max-w-[80%] p-3 rounded-lg bg-secondary text-secondary-foreground">
					<p>Vous devez être connecté pour accéder à cette page</p>
				</div>
			</div>
			<div className="p-4 border-t flex justify-center">
				<Button
					onClick={() => {
						if (sessionStorage.getItem("growth-app-session") === "done") {
							setIsSalim(false);
							setIsLoggedIn(false);
							setNbEssais(0);
							alert("Vous avez déjà utilisé vos essais gratuits");
						} else {
							setIsSalim(false);
							setIsLoggedIn(true);
							setNbEssais(1);
						}
					}}>
					Obtenir 3 essais gratuits
				</Button>
			</div>
			<div className="p-4 border-t">
				<Input
					type="password"
					placeholder="Mot de passe..."
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className="w-full"
					autoComplete="current-password"
					required
				/>
			</div>
			<div className="flex justify-center">
				<Button
					type="submit"
					disabled={isLoading}
					onClick={() => {
						login(password);
					}}>
					<Send className="h-4 w-4" />
					<span className="sr-only">Envoyer</span>
				</Button>
			</div>
		</div>
	);
}
