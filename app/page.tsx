"use client"

import { ChatOpenAI } from "@langchain/openai"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { useState } from "react"
import { Bot, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import ReactMarkdown from "react-markdown"

type Message = {
  content: string
  isUser: boolean
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const llm = new ChatOpenAI({
    model: "gpt-4o",
    temperature: 0.7,
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, // Sécurisez votre clé API
  })

  const postCSVLink =
    "https://huggingface.co/datasets/IgnitionAI/growth-post/resolve/main/671fbf031eb34_posts.csv"
  const accrocheTextLink =
    "https://huggingface.co/datasets/IgnitionAI/growth-post/resolve/main/accroche.txt"

  const generateLinkedInPosts = async () => {
    try {
      // Charger les fichiers
      const csvResponse = await fetch(postCSVLink)
      const csvData = await csvResponse.text()
      // take only 30 rows randomly
      const filteredCSV = csvData.split("\n").slice(0, 30)

      const accrocheResponse = await fetch(accrocheTextLink)
      const accrocheText = await accrocheResponse.text()

      // Créer un prompt pour générer des posts LinkedIn
      const prompt = ChatPromptTemplate.fromTemplate(`
En vous basant sur les données suivantes :
-Formatage du texte : MARKDOWN
- **Texte d'accroche** : {accrocheText}
- **Données CSV** : {filteredCSV}

Générez 5 exemples de posts LinkedIn professionnels et percutants. Chaque post doit être unique, captivant, et formaté pour LinkedIn. Utilisez un ton professionnel et dynamique, axé sur les domaines d'expertise en IA, MLOps, déploiement cloud, computer vision, etc., pour mettre en valeur des idées, tendances et opportunités dans ces domaines. L'objectif est d'attirer l'intérêt de professionnels sans se centrer directement sur l'auteur.

**Les posts doivent :**
- Avoir un **titre accrocheur**
- Offrir des **insights pratiques** ou **tendances du secteur**
- **Faire entre 100 et 250 mots**
- Susciter la curiosité et inciter à engager la conversation ou la collaboration

**Répondez uniquement avec une liste structurée :**
1.

2. Post 1 avec son contenu
3.

4. Post 2 avec son contenu
5.

6. Post 3 avec son contenu
7.

8. Post 4 avec son contenu
9.

10. Post 5 avec son contenu
11.

---

En orientant le contenu sur les sujets d’actualité et les besoins dans ces domaines, les publications pourront susciter des collaborations en valorisant des expertises stratégiques et des opportunités sans donner l'impression d'une auto-promotion directe.`)

      // Créer la chaîne de génération de texte
      const chain = prompt.pipe(llm)

      // Générer les posts
      const response = await chain.invoke({
        accrocheText: accrocheText,
        filteredCSV: filteredCSV,
      })

      // Retourner les posts générés
      return response.content
    } catch (error) {
      console.error("Erreur lors de la génération des posts :", error)
      return "Une erreur s'est produite lors de la génération des posts."
    }
  }

  // Méthode pour afficher les posts générés
  const handleGenerateLinkedInPosts = async () => {
    setIsLoading(true)
    const posts = await generateLinkedInPosts()

    const newAIMessage = {
      content: posts as string,
      isUser: false,
    }

    // Mettre à jour les messages (assumant que vous avez toujours le state messages et setMessages)
    setMessages(prevMessages => [...prevMessages, newAIMessage])
    setIsLoading(false)
  }

  return (
    <div className="flex flex-col h-[600px] max-w-2xl mx-auto border rounded-lg overflow-hidden">
      <div className="bg-primary p-4">
        <h2 className="text-2xl font-bold text-primary-foreground">
          Growth APP - AI Chat
        </h2>
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
              Thinking... 🤔
            </div>
          </div>
        )}
      </ScrollArea>
      <div className="p-4 border-t">
        <form
          onSubmit={e => {
            e.preventDefault()
            handleGenerateLinkedInPosts()
          }}
          className="flex space-x-2">
          <Input
            type="text"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
          />
          <Button type="submit" disabled={isLoading}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  )
}
