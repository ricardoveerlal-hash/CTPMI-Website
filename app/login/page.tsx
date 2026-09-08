import PhoneInput from "@/components/PhoneInput";

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-8 pt-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-paper">
          Enter your number
        </h1>
        <p className="mt-2 text-sm text-paper/60">
          If you&rsquo;re already registered with CTPMI, this is all you need.
          New here? We&rsquo;ll get you set up in a minute.
        </p>
      </div>
      <PhoneInput />
    </div>
  );
}
