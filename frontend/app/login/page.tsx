'use client'
import { Typography, Input, Checkbox, Button } from "@material-tailwind/react";
import Link from 'next/link'
import Image from 'next/image'

export function SignIn() {
    return (
        <section className="grid h-screen items-center lg:grid-cols-2 bg-white">
            <div className="my-auto p-8 text-center sm:p-10 md:p-20 xl:px-32 xl:py-24">
                <Typography variant="h3" color="blue-gray" className="mb-2">
                    Sign In
                </Typography>
                <Typography color="gray" className="mb-16">
                    Enter your email and password to sign in
                </Typography>

                <form action="#" className="mx-auto max-w-[24rem] text-left">
                    <div className="mb-6">
                        <label htmlFor="email">
                            <Typography
                                variant="small"
                                className="mb-2 block font-medium text-gray-900"
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
                            className="focus:!border-t-gray-900"
                            labelProps={{
                                className: "hidden",
                            }} crossOrigin={undefined} />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password">
                            <Typography
                                variant="small"
                                className="mb-2 block font-medium text-gray-900"
                            >
                                Password
                            </Typography>
                        </label>
                        <Input
                            id="password"
                            color="gray"
                            size="lg"
                            type="password"
                            name="password"
                            placeholder="password"
                            className="focus:!border-t-gray-900"
                            labelProps={{
                                className: "hidden",
                            }}
                        />
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
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="-ml-3">
                            <Checkbox
                                color="gray"
                                label="Subscribe me to newsletter"
                                labelProps={{
                                    className: "font-medium",
                                }}
                            />
                        </div>
                        <Typography as="a" href="#" color="gray" className="font-medium">
                            Forgot password
                        </Typography>
                    </div>
                    <Button color="gray" size="lg" className="mt-6" fullWidth>
                        sign in
                    </Button>
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