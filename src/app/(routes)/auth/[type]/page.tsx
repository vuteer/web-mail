
import Link from "next/link";
import AuthForm from "@/auth/forms";
import { Separator } from "@/components/ui/separator";
import { Heading1, Heading2, Paragraph } from "@/components/ui/typography";
import {images} from "@/assets"; 
import AppImage from "@/components/common/app-image";

const Auth = ({params}: {params: {type: string}}) => {

    return (
        <section className="w-full h-full flex flex-col lg:flex-row">
            <Welcome />
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="lg:max-w-[450px] w-full flex-1 flex justify-center flex-col gap-3">
                    {/* <Heading variant="h1" title="Login" cls="text-center" /> */}
                    <Heading2 className="capitalize text-center">{params.type}</Heading2>
                    <Paragraph className="text-center">
                        {
                            params.type === "forgot" ? "Enter your email to request a password reset": 
                                "You have to be registered by your domain admin to login"
                        }
                    </Paragraph>
                    
                    <Separator />
                    <AuthForm
                        screen={params.type}
                        values={{email: "", password: ""}}
                        buttonText="Submit"
                    />
                    <Link className="text-xs lg:text-md hover:text-primary-color" href={params.type === "login" ? "/auth/forgot": "/auth/login"}>{params.type === "forgot" ? "Login to your account": "Forgot password?"}</Link>
                </div>
            {/* <Footer /> */}
            </div>
        </section>
    )
};

export default Auth; 


const Welcome = () => (
    <div className="flex flex-col items-center justify-center w-full lg:w-[50%] bg-[#020817] lg:h-full h-[50vh]">
        <AppImage 
            src={images.logo.src}
            alt="logo"
            title="logo"
            width={70}
            height={70}
            cls="my-3"
        />
        <Heading1 className="text-white text-center">Welcome to Vu.Mail</Heading1>
        <Paragraph className="text-white my-3 text-center">The modern way to receive and send your business emails.</Paragraph>
        <div className="-mt-5 w-[80%] h-[50%] relative overflow-hidden rounded-lg">
            <AppImage 
                src={images.auth_screen.src}
                alt="auth screen"
                title="auth screen"
                objectFit="contain"
                cls="object-contain rounded-lg"
                fill
            />
        </div>
        <Paragraph className="text-white -mt-5 z-[40] text-center">
            <span>Register your business </span>
            <Link href="https://app.vuteer.com" target="_blank" className="text-blue-500 hover:text-red-500">HERE</Link>
        </Paragraph>
    </div>
)