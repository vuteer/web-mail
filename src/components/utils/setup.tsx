"use client";
import React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Heading2,
  Heading3,
  Heading4,
  Paragraph,
} from "@/components/ui/typography";
import { Input } from "../ui/input";

import { createToast } from "@/utils/toast";
import { validateEmail } from "@/utils/validation";
import { finalizeUserSetup, getUserSettings } from "@/lib/api-calls/user";

import { useCustomEffect } from "@/hooks";
import { userStateStore } from "@/stores/user-store";
import { userPreferencesStore } from "@/stores/user-preferences";
import useMounted from "@/hooks/useMounted";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const FinalizeSetup = ({}) => {
  const { contact_email, finalized_setup, loading } = userStateStore();
  const { addInitial } = userPreferencesStore();
  const { push } = useRouter();
  // const signOut = useSignOut();

  const [cLoading, setCLoading] = React.useState<boolean>(false);
  const [password, setPassword] = React.useState<string>("");
  const [passwordConfirm, setPasswordConfirm] = React.useState<string>("");
  const [dontShow, setDontShow] = React.useState<boolean>(false);
  const mounted = useMounted();

  const [email, setEmail] = React.useState<string>("");
  const [errors, setErrors] = React.useState<string[]>([]);

  React.useEffect(() => {
    setDontShow(!finalized_setup);
  }, [finalized_setup]);

  const fetchPreferences = async () => {
    if (!finalized_setup || !mounted) return;
    let res = await getUserSettings();
    if (res) addInitial(res.signature, res.notifications, res.security);
  };

  useCustomEffect(fetchPreferences, [finalized_setup, mounted]);

  const handleSubmit = async () => {
    if (!password) {
      setErrors([...errors, "password"]);
      createToast("Error", "Enter a valid password.", "danger");
      setTimeout(() => {
        setErrors([...errors.filter((err) => err !== "password")]);
      }, 2000);
      return;
    }
    if (!passwordConfirm) {
      setErrors([...errors, "passwordConfirm"]);
      createToast("Error", "Confirm password.", "danger");
      setTimeout(() => {
        setErrors([...errors.filter((err) => err !== "passwordConfirm")]);
      }, 2000);
      return;
    }

    if (password.length < 6) {
      setErrors([...errors, "password"]);
      createToast(
        "Error",
        "Password must be at least 6 characters long.",
        "danger",
      );
      setTimeout(() => {
        setErrors([...errors.filter((err) => err !== "password")]);
      }, 2000);
      return;
    }

    if (password !== passwordConfirm) {
      setErrors([...errors, "passwordConfirm"]);
      createToast("Error", "Passwords do not match.", "danger");
      setTimeout(() => {
        setErrors([...errors.filter((err) => err !== "passwordConfirm")]);
      }, 2000);
      return;
    }

    if (!contact_email && !validateEmail(email)) {
      setErrors([...errors, "email"]);
      setTimeout(() => {
        setErrors([...errors.filter((err) => err !== "email")]);
      }, 2000);
      return;
    }

    setCLoading(true);
    let data: any = {
      password,
      passwordConfirm,
    };

    if (!contact_email) data.email = email;

    let res = await finalizeUserSetup(data);

    if (res) {
      createToast("Success", "Done, Login again!", "success");
      setDontShow(false);
      push("/auth/login");
      signOut();
    }
    setCLoading(false);
  };

  return (
    <>
      {!loading && dontShow && (
        <div className="absolute top-0 left-0 z-40 w-[100vw] h-[100vh] flex items-center justify-center bg-black-transparent z-40">
          <Card className="max-w-[30%] w-full h-fit p-4 flex flex-col gap-3">
            <Heading2>
              {contact_email
                ? "Password update after reset"
                : "Welcome to you personal business mail."}
            </Heading2>

            <Paragraph>
              {contact_email
                ? "Your password was recently reset by an admin. Update it before your proceed"
                : "Before we can proceed, you need to update your password and add a personal email address that you can be reached at and then click on submit."}
            </Paragraph>

            {!contact_email && (
              <Paragraph>
                The email is used to send you notifications of new mails.
              </Paragraph>
            )}

            <div className="my-1" />
            <Heading3 className="text-md lg:text-lg">Update password</Heading3>

            <InputPair
              value={password}
              setValue={setPassword}
              error={errors.includes("password")}
              placeholder="Enter a new password"
              type={"password"}
              disabled={cLoading}
            />
            <InputPair
              value={passwordConfirm}
              setValue={setPasswordConfirm}
              error={errors.includes("passwordConfirm")}
              placeholder="Confirm password"
              type={"password"}
              disabled={cLoading}
            />
            <div className="my-1" />
            {!contact_email && (
              <>
                <Heading3 className="text-md lg:text-lg">
                  Contact email
                </Heading3>
                <InputPair
                  value={email}
                  setValue={setEmail}
                  error={errors.includes("email")}
                  placeholder="Enter email"
                  disabled={cLoading}
                />
              </>
            )}

            <Button
              disabled={cLoading}
              className="min-w-[150px] my-2"
              onClick={handleSubmit}
            >
              Submit{cLoading ? "ing..." : ""}
            </Button>
          </Card>
        </div>
      )}
    </>
  );
};

export default FinalizeSetup;

export const InputPair = ({
  label,
  value,
  placeholder,
  setValue,
  error,
  type,
  onKeyUp,
  prefixes,
  disabled,
}: {
  label?: string;
  placeholder: string;
  value: string;
  setValue: React.Dispatch<string>;
  error?: boolean;
  type?: string;
  onKeyUp?: (str: string, keyValue?: string) => Promise<void>;
  prefixes?: React.ReactNode;
  disabled: boolean;
}) => {
  const [active, setActive] = React.useState<boolean>(false);
  return (
    <div
      className={cn(
        "flex w-[100%] items-center border-b-[.08rem]",
        active ? "border-b-main-color" : error ? "border-b-danger" : "",
      )}
    >
      {label && <Heading4 className="text-sm lg:text-md">{label}</Heading4>}
      {prefixes && prefixes}
      <Input
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setValue(e.target.value)
        }
        className={`${!label ? "pl-0" : ""} border-none focus:border-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0`}
        onFocus={() => {
          setActive(true);
        }}
        onBlur={() => {
          setActive(false);
        }}
        onKeyUp={
          onKeyUp ? (e: any) => onKeyUp(e.target.value, e.key) : () => {}
        }
        type={type || "string"}
      />
    </div>
  );
};
