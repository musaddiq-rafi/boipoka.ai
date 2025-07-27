import CharacterChatWindow from '@/components/character-chat/CharacterChatWindow';

export default function CharacterChatPage({ params }: { params: { chatId: string } }) {
  return <CharacterChatWindow chatId={params.chatId} />;
}