import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "sonner";

interface NewNoteCardProps {
  onNoteCreated: (content: string) => void;
}

let speechRecognition: SpeechRecognition | null = null

export function NewNoteCard({ onNoteCreated }: NewNoteCardProps) {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [content, setContent] = useState("");

  function handleStartEditor() {
    setShouldShowOnboarding(false);
  }

  function handleContentChanged(e: ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.target.value);

    if (e.target.value == "") {
      setShouldShowOnboarding(true);
    }
  }

  function handleSaveNote(e: FormEvent) {
    e.preventDefault();

    if (content == "") {
      return;
    }

    onNoteCreated(content);

    setContent("");
    setShouldShowOnboarding(true);

    toast.success("Nota criada com sucesso");
  }

  function handleStartRecord() {
    const isSpeechRecognitionAPIAvailable =
      "SpeechRecognition" in window || "webkitSpeechRecognition" in window;

    if (!isSpeechRecognitionAPIAvailable) {
      alert("Infelizmente seu navegador não suporta a API de gravação!");
      return;
    }

    setIsRecording(true);
    setShouldShowOnboarding(false);

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    speechRecognition = new SpeechRecognitionAPI();

    speechRecognition.lang = "pt-BR";
    speechRecognition.continuous = true;
    speechRecognition.maxAlternatives = 1;
    speechRecognition.interimResults = true;

    speechRecognition.onresult = (e) => {
      const transcription = Array.from(e.results).reduce((text, result) => {
        return text.concat(result[0].transcript)
      }, '');

      setContent(transcription)
    };

    speechRecognition.onerror = (e) => {
      console.error(e);
    };

    speechRecognition.start();
  }

  function handleStopRecording() {
    setIsRecording(false);

    if(speechRecognition != null) {
      speechRecognition.stop()
    }
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger className="flex flex-col text-left rounded-md bg-slate-700 p-5 gap-3 outline-none hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-300">
        <span className="text-sm font-medium text-slate-200">
          Adicionar nota
        </span>
        <p className="text-sm leading-6 text-slate-400">
          Comece gravando uma nota em áudio ou se preferir utilize apenas texto.
        </p>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="inset-0 fixed bg-black/60" />
        <Dialog.Content className="fixed overflow-hidden inset-0 md:inset-auto md:-translate-x-1/2 md:-translate-y-1/2 md:left-1/2 md:top-1/2 md:max-w-[600px] w-full md:h-[60vh] bg-slate-700 md:rounded-md flex flex-col outline-none">
          <Dialog.Close
            onClick={() => setShouldShowOnboarding(true)}
            className="absolute right-0 top-0 bg-slate-800 text-slate-700 p-1.5 hover:text-slate-400"
          >
            <X className="size-5" />
          </Dialog.Close>

          <form className="flex-1 flex flex-col">
            <div className="flex flex-1 flex-col gap-3 p-5">
              <span className="text-sm font-medium text-slate-300">
                Adicionar nota
              </span>
              {shouldShowOnboarding ? (
                <p className="text-sm leading-6 text-slate-400">
                  Comece{" "}
                  <button
                    type="button"
                    onClick={handleStartRecord}
                    className="text-lime-400 hover:underline font-medium"
                  >
                    gravando uma nota
                  </button>{" "}
                  em áudio ou se preferir{" "}
                  <button
                    type="button"
                    onClick={handleStartEditor}
                    className="text-lime-400 hover:underline font-medium"
                  >
                    utilize apenas texto.
                  </button>
                </p>
              ) : (
                <textarea
                  className="bg-transparent text-sm text-slate-400 resize-none flex-1 outline-none"
                  autoFocus
                  placeholder="Digite sua nota..."
                  onChange={handleContentChanged}
                  value={content}
                />
              )}
            </div>

            {isRecording ? (
              <button
                type="button"
                onClick={handleStopRecording}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-center font-bold text-sm text-slate-300 hover:text-slate-100 outline-none"
              >
                <div className="size-3 rounded-full animate-pulse bg-red-500" />
                Gravando! (clique p/ interromper)
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveNote}
                className="w-full bg-lime-400 py-4 text-center font-bold text-sm text-lime-950 hover:bg-lime-500 outline-none"
              >
                Salvar nota
              </button>
            )}
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
