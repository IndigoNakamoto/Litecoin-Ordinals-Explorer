'use client'
import { Typography, Input, Checkbox, Button } from "@material-tailwind/react";
import Link from 'next/link'
import Image from 'next/image'

export function SignIn() {
    return (
        <section className="grid h-screen items-center lg:grid-cols-2 bg-white">
            <div className="my-auto p-8 text-center sm:p-10 md:p-20 xl:px-32 xl:py-24">
                <Typography variant="h3" color="blue-gray" className="mb-2">
                    Log In
                </Typography>
                <Typography color="gray" className="mb-16">
                    Sign in with your account
                </Typography>
                <form action="#" className="mx-auto max-w-[24rem] text-left">
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
                    <div className="mb-6">

                        <Typography
                            variant="small"
                            className="mt-2 block font-medium text-gray-600"
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
                    <Typography color="gray" className="mt-6 text-center font-normal">
                        Not registered?{" "}
                        <Link href="/signup" className="font-medium text-gray-900">
                            Create account
                        </Link>
                    </Typography>
                </form>
            </div>
            <Image
                src={`/background.webp`}
                width={5120}
                height={2880}
                alt="background image"
                className="hidden h-screen w-full object-cover lg:block"
            />
        </section>
    );
}

export default SignIn;