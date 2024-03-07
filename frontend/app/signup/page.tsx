'use client'
import { Typography, Input, Button } from "@material-tailwind/react";
import Link from 'next/link'
import Image from 'next/image'

export function SignUp() {
    return (
        <section className="grid h-screen items-center bg-white">
            <div className="text-center">
                <Typography variant="h3" color="black" className="mb-2">
                    Inscribe on Litecoin Today
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