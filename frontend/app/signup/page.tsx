'use client'
import { Typography, Input, Button } from "@material-tailwind/react";
import Link from 'next/link'
import Image from 'next/image'

export function SignUp() {
    return (
        <section className="grid h-screen items-center bg-white">
            <div className="text-center">
                <Typography variant="h3" color="black" className="mb-2">
                    Join us today
                </Typography>
                <Typography color="black" className="mb-12">
                    Enter your email and password to register.
                </Typography>
                <form action="#" className="mx-auto max-w-[24rem] text-left">
                    <div>
                        <label htmlFor="email">
                            <Typography
                                variant="small"
                                className="mb-2 block font-medium text-gray-800"
                            >
                                Your Email
                            </Typography>
                        </label>
                        <Input
                            id="email"
                            color="gray"
                            size="lg"
                            type="email"
                            name="email"
                            placeholder="name@email.com"
                            className="focus:!border-t-gray-900 rounded-lg"
                            labelProps={{
                                className: "hidden",
                            }} crossOrigin={undefined} />
                        <Typography
                            variant="small"
                            className="mt-2 block font-medium text-gray-400"
                        >
                            I agree to the{" "}
                            <a
                                href="#"
                                className="underline transition-colors hover:text-gray-900"
                            >
                                Terms and Conditions
                            </a>
                        </Typography>
                    </div>
                    <Button color="white" size="lg" className="mt-4 text-black" fullWidth>
                        Register now
                    </Button>
                    <div className="my-6 flex w-full items-center gap-2">
                        <hr className="w-full bg-slate-50" />
                        <Typography
                            variant="small"
                            color="black"
                            className="font-medium opacity-50"
                        >
                            OR
                        </Typography>
                        <hr className="w-full bg-slate-50" />
                    </div>
                    <Button
                        color="white"
                        size="lg"
                        className="mt-4 flex h-12 items-center justify-center gap-2 text-black"
                        fullWidth
                    >
                        <Image
                            src={`/logos/google-g.png`}
                            width={32}
                            height={32}
                            alt="google"
                            className="h-6 w-6"
                        />{" "}
                        sign in with google
                    </Button>
                    <Button
                        color="white"
                        size="lg"
                        className="mt-4 flex h-12 items-center justify-center gap-2 text-black"
                        fullWidth
                    >
                        <Image
                            src={`/logos/x-black.png`}
                            width={32}
                            height={32}
                            alt="google"
                            className="h-6 w-6"
                        />{" "}
                        sign in with x
                    </Button>
                    <Typography color="black" className="mt-6 text-center font-normal text-gray-400">
                        Already have an account?{" "}
                        <Link href="/login" className="font-medium text-gray-400">
                            Log in
                        </Link>
                    </Typography>
                </form>
            </div>
        </section>
    );
}

export default SignUp;