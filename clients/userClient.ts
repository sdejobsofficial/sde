  import { convertToPascalCase, convertToSnakeCase } from "@/lib/casing";
  import {
    UpdateCompanyMetaDTO,
    UpdateJobSeekerMetaDTO,
    User,
  } from "@/models/userModel";
  import { createClient } from "@/supabase/client";

  export const getCurrentSession = async () => {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) {
      return null;
    }
    return user;
  };

  export const getCurrentUser = async () => {
    const supabase = createClient();
    const user = await getCurrentSession();
    if (!user) {
      return null;
    }
    const { data, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();
    if (fetchError) {
      console.log(fetchError);
      return null;
    }
    return convertToPascalCase(data) as User;
  };

  export const updateJobSeekerMeta = async (meta: UpdateJobSeekerMetaDTO) => {
    const supabase = createClient();
    const user = await getCurrentSession();
    if (!user) {
      console.log("No user session found");
      return;
    }
    const { error } = await supabase
      .from("users")
      .update({ meta: convertToSnakeCase(meta) })
      .eq("id", user.id);
    if (error) {
      console.log(error);
    }
  };

  export const updateCompanyMeta = async (
    meta: UpdateCompanyMetaDTO,
    name: string,
    phone: number,
  ) => {
    const supabase = createClient();
    const user = await getCurrentSession();
    if (!user) {
      console.log("No user session found");
      return;
    }
    const { error } = await supabase
      .from("users")
      .update({ meta: convertToSnakeCase(meta), name: name, phone: phone })
      .eq("id", user.id);
    if (error) {
      console.log(error);
    }
  };
