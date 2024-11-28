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

type Message = {
	content: string;
	isUser: boolean;
};

const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

export default function Home() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [inputMessage, setInputMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [csvData, setCsvData] = useState<any[]>([]);

	const llm = new ChatOpenAI({
		modelName: "gpt-4", // Correction du nom du modèle
		temperature: 0.7,
		apiKey: apiKey,
	});

	const freightsCSVLink =
		"https://huggingface.co/datasets/IgnitionAI/spydr-pock/resolve/main/freights.csv";

	const loadCsvData = async () => {
		try {
			const freightsResponse = await fetch(freightsCSVLink);
			const csvContent = await freightsResponse.text();
			const parsedData = parseCsv(csvContent);
			setCsvData(parsedData);
		} catch (error) {
			console.error("Erreur lors du chargement du CSV :", error);
		}
	};

	const parseCsv = (csvContent: string) => {
		const rows = csvContent.split("\n");
		const headers = rows[0].split(",");
		return rows.slice(1).map((row) => {
			const values = row.split(",");
			return headers.reduce((acc, header, index) => {
				acc[header.trim()] = values[index]?.trim() || "";
				return acc;
			}, {} as Record<string, string>);
		});
	};

	const askQuestionAboutCsv = async (question: string) => {
		if (question.trim() === "") return;

		setIsLoading(true);
		// Ajouter le message de l'utilisateur
		setMessages((prev) => [...prev, { content: question, isUser: true }]);
		setInputMessage("");

		try {
			// Créer un prompt template pour mieux structurer la question
			const prompt = ChatPromptTemplate.fromTemplate(`
        En tant qu'assistant, aide-moi à analyser ces données de fret.
        Contexte: {context}
        Question: {question}
        Réponds de manière concise et précise.
		Tu ajouteras aussi une requete SQL pour récupérer les données correspondantes à la question (tu ne dois pas dire que c'est un csv et faire comme si c'etait une base de données)
      `);

			const chain = prompt.pipe(llm);

			const response = await chain.invoke({
				question: question,
				context: JSON.stringify(csvData.slice(0, 10)), // Limiter le contexte pour éviter les dépassements de tokens
			});

			setMessages((prev) => [
				...prev,
				{ content: response.content.toString(), isUser: false },
			]);
		} catch (error) {
			console.error("erreur dans la réponse", error);
			setMessages((prev) => [
				...prev,
				{ content: "Désolé, une erreur est survenue.", isUser: false },
			]);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		loadCsvData();
	}, []);

	const isDisabled = () => {
		return inputMessage.trim() === "" || isLoading;
	};

	return (
		<div className="flex flex-col h-[600px] max-w-2xl mx-auto border rounded-lg overflow-hidden">
			<div className="bg-primary p-4">
				<h2 className="text-2xl font-bold text-primary-foreground flex items-center">
					<Logo />
					QA - DATA
				</h2>
			</div>
			<ScrollArea className="flex-grow p-4 space-y-4">
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
							Je suis en train de répondre à votre question... 🤔
						</div>
					</div>
				)}
			</ScrollArea>
			<div className="p-4 border-t">
				<form
					onSubmit={(e) => {
						e.preventDefault();
						askQuestionAboutCsv(inputMessage);
					}}
					className="flex space-x-2">
					<Input
						type="text"
						placeholder="Type your message..."
						value={inputMessage}
						onChange={(e) => setInputMessage(e.target.value)}
					/>
					<Button type="submit" disabled={isDisabled()}>
						<Send className="h-4 w-4" />
						<span className="sr-only">Send</span>
					</Button>
				</form>
			</div>
		</div>
	);
}
