"use client";

import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import * as use from "@tensorflow-models/universal-sentence-encoder";
import { useEffect, useState } from "react";

const postCSVLink =
	"https://huggingface.co/datasets/IgnitionAI/growth-post/resolve/main/671fbf031eb34_posts.csv";
const accrocheTextLink =
	"https://huggingface.co/datasets/IgnitionAI/growth-post/resolve/main/accroche.txt";

export const useEmbeddingModel = () => {
	const [embeddingLoading, setEmbeddingLoading] = useState(true);
	const [model, setModel] = useState<use.UniversalSentenceEncoder | null>(null);
	const [loadingWorkflow, setLoadingWorkflow] = useState(false);
	const [embeddings, setEmbeddings] = useState<{
		csv: number[][] | null;
		txt: number[][] | null;
	}>({ csv: null, txt: null });

	// Fonction pour récupérer et parser le contenu des fichiers
	async function fetchFileContent(url: string): Promise<string[]> {
		try {
			const response = await fetch(url);
			if (!response.ok) throw new Error(`Failed to fetch file from ${url}`);
			const content = await response.text();
			return url.endsWith(".csv") ? parseCSV(content) : parseTXT(content);
		} catch (error) {
			console.error("Error fetching file:", error);
			return [];
		}
	}

	function parseCSV(content: string): string[] {
		return content
			.split("\n")
			.map((line) => line.trim())
			.filter(Boolean);
	}

	function parseTXT(content: string): string[] {
		return content
			.split("\n")
			.map((line) => line.trim())
			.filter(Boolean);
	}

	// Fonction pour charger les embeddings avec gestion de la mémoire
	async function embeddingFunction() {
		if (!model) return;

		try {
			setEmbeddingLoading(true);

			// Charger les fichiers
			const csvContent = await fetchFileContent(postCSVLink);
			const txtContent = await fetchFileContent(accrocheTextLink);

			// Traiter les données par lots pour éviter la surcharge mémoire
			const BATCH_SIZE = 8;
			console.log("Batch size:", BATCH_SIZE);
			let arrayCSV: number[][] = [];
			let arrayTXT: number[][] = [];

			// Traitement par lots pour CSV
			for (let i = 0; i < csvContent.length; i += BATCH_SIZE) {
				const batch = csvContent.slice(i, i + BATCH_SIZE);

				const embedded = await model.embed(batch);
				const arrays = embedded.arraySync();
				arrayCSV.push(...arrays);
				tf.dispose(embedded);
			}

			// Traitement par lots pour TXT
			for (let i = 0; i < txtContent.length; i += BATCH_SIZE) {
				const batch = txtContent.slice(i, i + BATCH_SIZE);
				const embedded = await model.embed(batch);
				const arrays = embedded.arraySync();
				arrayTXT.push(...arrays);
				tf.dispose(embedded);
			}

			console.log("Embeddings generated successfully");
			setEmbeddings({ csv: arrayCSV, txt: arrayTXT });
		} catch (error) {
			console.error("Error during embedding generation:", error);
		} finally {
			// Nettoyage de la mémoire
			tf.disposeVariables();
			setEmbeddingLoading(false);
		}
	}

	// Fonction pour charger le modèle
	async function loadModel() {
		try {
			setEmbeddingLoading(true);
			await tf.ready();
			const loadedModel = await use.load();
			setModel(loadedModel);
			console.log("Model loaded successfully");
		} catch (error) {
			console.error("Error loading model:", error);
		} finally {
			setEmbeddingLoading(false);
		}
	}

	// Workflow complet dans useEffect
	useEffect(() => {
		async function generateEmbeddings() {
			if (model) {
				console.log("Starting embedding generation...");
				await embeddingFunction();
			}
		}
		generateEmbeddings();
	}, [model]); // Dépendance à model

	// useEffect pour charger le modèle uniquement
	useEffect(() => {
		async function runWorkflow() {
			setLoadingWorkflow(true);
			console.log("Loading model...");
			await loadModel();
			console.log("Model loaded.");
			setLoadingWorkflow(false);
		}

		runWorkflow();
	}, []); // Pas de dépendances

	return { model, embeddings, loadingWorkflow, embeddingLoading };
};
