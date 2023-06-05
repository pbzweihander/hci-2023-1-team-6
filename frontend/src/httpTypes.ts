export interface MessageHistory {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface Relationship {
  to: string;
  description: string;
}

export interface PostGenerateNameReq {
  histories: MessageHistory[];
  characteristics: string[];
  relationships: Relationship[];
}
