import { AxiosError } from "axios";
import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
} from "react-query";

import { useAxiosClient } from "./axiosContext";
import { PostGenerateNameReq } from "./httpTypes";

type MutationRet<T, Ret = void> = UseMutationResult<
  Ret,
  AxiosError,
  T,
  undefined
>;
type MutationOption<T, Ret = void> = Omit<
  UseMutationOptions<Ret, AxiosError, T, undefined>,
  "mutationFn"
>;

export function useGenerateNameMutation(
  options?: MutationOption<PostGenerateNameReq, string>
): MutationRet<PostGenerateNameReq, string> {
  const client = useAxiosClient();
  return useMutation(async (payload: PostGenerateNameReq) => {
    const resp = await client.post<string>("/api/name/generate", payload);
    return resp.data;
  }, options);
}
