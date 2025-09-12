import { MessagesSquare, Send } from "lucide-react";
import { Conversation } from "./types";

function CardConversation(props: {
  value: Conversation;
}) {
  const userIdentifier = ()=>{
    if(props.value.channel === 'dashboard'){
      return props.value.aiUserIdentifier ? props.value.aiUserIdentifier : `VISITOR #${props.value.id.substring(props.value.id.length - 3, props.value.id.length).toUpperCase()}`;
    } else if(props.value.channel === 'telegram'){
      return props.value.participantsContacts && props.value.participantsContacts.length > 0 && props.value.participantsContacts[0].firstName ? props.value.participantsContacts[0].firstName : `TELEGRAM USER #${props.value.id.substring(props.value.id.length - 3, props.value.id.length).toUpperCase()}`;
    }
  }
  return (
    <div className="bg-secondary-500/20 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-1">
      {props.value.channel === 'dashboard' && <MessagesSquare size={32} />}
      {props.value.channel === 'telegram' && <Send size={32} />}
      <div>
        <div className="flex justify-between items-center">
          <span className="text- font-semibold mb-2">{userIdentifier()}</span> <button className="w-20 h-20 rounded-xl "></button>
        </div>
        <p className="text-sm text-text-900">Status: {props.value.status}</p>
        <p className="text-sm text-text-900">Priority: {props.value.priority}</p>
        <p className="text-sm text-text-900">Created At: {new Date(props.value.createdAt).toLocaleString()}</p>
      </div>
    </div>
  );
}
export default CardConversation;