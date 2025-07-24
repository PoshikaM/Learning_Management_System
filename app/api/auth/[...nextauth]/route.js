import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth from 'next-auth/next';
import connectToDatabase from "../../../../utils/mongodb";
import User from "../../../../models/User";
import bcrypt from 'bcryptjs';

const NEXT_AUTH = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }
        let db;
        try {
          db = await connectToDatabase();
          console.log('Connected to MongoDB');
        } catch (err) {
          console.error('MongoDB connection error:', err);
          throw new Error('Database connection failed');
        }
        const user = await User.findOne({ email: credentials.email }).lean();
        if (!user) {
          console.log('Login failed for email:', credentials.email, '- Invalid credentials');
          return null;
        }
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          console.log('Login failed for email:', credentials.email, '- Invalid password');
          return null;
        }
        console.log('Login successful for user:', {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          timestamp: new Date().toISOString()
        });
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.name = user.name;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // console.log('Session callback - Creating session for user:', {
        //   id: token.sub,
        //   email: session.user.email,
        //   name: token.name,
        //   role: token.role,
        //   timestamp: new Date().toISOString()
        // });
        session.user.name = token.name;
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/signin',
  },
};

const handler = NextAuth(NEXT_AUTH);
export { handler as GET, handler as POST }