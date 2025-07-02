
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Vibrant colors
				vibrant: {
					purple: 'hsl(var(--vibrant-purple))',
					pink: 'hsl(var(--vibrant-pink))',
					cyan: 'hsl(var(--vibrant-cyan))',
					orange: 'hsl(var(--vibrant-orange))',
					lime: 'hsl(var(--vibrant-lime))',
					yellow: 'hsl(var(--vibrant-yellow))'
				},
				neon: {
					blue: 'hsl(var(--neon-blue))',
					purple: 'hsl(var(--neon-purple))',
					pink: 'hsl(var(--neon-pink))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				// Plūduriuojančių elementų animacijos
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-20px)' }
				},
				'float-delayed': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-15px)' }
				},
				'float-slow': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				// Gradientų animacijos
				'gradient-shift': {
					'0%, 100%': { 
						backgroundPosition: '0% 50%' 
					},
					'50%': { 
						backgroundPosition: '100% 50%' 
					}
				},
				'gradient-x': {
					'0%, 100%': {
						'background-size': '200% 200%',
						'background-position': 'left center'
					},
					'50%': {
						'background-size': '200% 200%',
						'background-position': 'right center'
					}
				},
				// Pulsing ir glow efektai
				'pulse-glow': {
					'0%, 100%': { 
						boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)',
						transform: 'scale(1)'
					},
					'50%': { 
						boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)',
						transform: 'scale(1.02)'
					}
				},
				'shimmer': {
					'0%': {
						backgroundPosition: '-1000px 0'
					},
					'100%': {
						backgroundPosition: '1000px 0'
					}
				},
				// Rašymo mašinėlės efektas
				'typewriter': {
					'0%': { width: '0' },
					'100%': { width: '100%' }
				},
				'blink': {
					'0%, 50%': { borderColor: 'transparent' },
					'51%, 100%': { borderColor: 'currentColor' }
				},
				// Morfingo efektai
				'morph': {
					'0%, 100%': { borderRadius: '20px' },
					'50%': { borderRadius: '50px' }
				},
				// Skaičių animacijos
				'count-up': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				// Dalelių animacijos
				'particle-float': {
					'0%': { 
						transform: 'translateY(100vh) rotate(0deg)',
						opacity: '0'
					},
					'10%': { opacity: '1' },
					'90%': { opacity: '1' },
					'100%': { 
						transform: 'translateY(-100vh) rotate(360deg)',
						opacity: '0'
					}
				},
				// Staggered animacijos
				'slide-in-left': {
					'0%': { 
						transform: 'translateX(-100px)',
						opacity: '0'
					},
					'100%': { 
						transform: 'translateX(0)',
						opacity: '1'
					}
				},
				'slide-in-right': {
					'0%': { 
						transform: 'translateX(100px)',
						opacity: '0'
					},
					'100%': { 
						transform: 'translateX(0)',
						opacity: '1'
					}
				},
				'scale-in': {
					'0%': { 
						transform: 'scale(0.8)',
						opacity: '0'
					},
					'100%': { 
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				// 3D transformacijos
				'card-flip': {
					'0%': { transform: 'rotateY(0deg)' },
					'100%': { transform: 'rotateY(180deg)' }
				},
				'card-hover': {
					'0%': { 
						transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)'
					},
					'100%': { 
						transform: 'perspective(1000px) rotateX(5deg) rotateY(5deg) scale(1.05)'
					}
				},
				// Vibrant new animations
				'neon-glow': {
					'0%, 100%': { 
						boxShadow: '0 0 10px hsl(var(--neon-blue)), 0 0 20px hsl(var(--neon-blue)), 0 0 30px hsl(var(--neon-blue))',
						transform: 'scale(1)'
					},
					'50%': { 
						boxShadow: '0 0 20px hsl(var(--neon-purple)), 0 0 40px hsl(var(--neon-purple)), 0 0 60px hsl(var(--neon-purple))',
						transform: 'scale(1.05)'
					}
				},
				'aurora-wave': {
					'0%': { 
						backgroundPosition: '0% 50%',
						filter: 'hue-rotate(0deg)'
					},
					'50%': { 
						backgroundPosition: '100% 50%',
						filter: 'hue-rotate(180deg)'
					},
					'100%': { 
						backgroundPosition: '0% 50%',
						filter: 'hue-rotate(360deg)'
					}
				},
				'bubble-rise': {
					'0%': {
						transform: 'translateY(100vh) scale(0)',
						opacity: '0'
					},
					'10%': {
						opacity: '1'
					},
					'90%': {
						opacity: '1'
					},
					'100%': {
						transform: 'translateY(-100vh) scale(1)',
						opacity: '0'
					}
				},
				'wobble': {
					'0%, 100%': { transform: 'rotate(-3deg)' },
					'50%': { transform: 'rotate(3deg)' }
				},
				'matrix-rain': {
					'0%': {
						transform: 'translateY(-100%)',
						opacity: '0'
					},
					'10%, 90%': {
						opacity: '1'
					},
					'100%': {
						transform: 'translateY(100vh)',
						opacity: '0'
					}
				},
				'rainbow-shift': {
					'0%': { filter: 'hue-rotate(0deg)' },
					'100%': { filter: 'hue-rotate(360deg)' }
				},
				'rotating-border': {
					'0%': { 
						backgroundPosition: '0% 50%' 
					},
					'50%': { 
						backgroundPosition: '100% 50%' 
					},
					'100%': { 
						backgroundPosition: '0% 50%' 
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				// Plūduriuojančių elementų animacijos
				'float': 'float 6s ease-in-out infinite',
				'float-delayed': 'float-delayed 8s ease-in-out infinite',
				'float-slow': 'float-slow 10s ease-in-out infinite',
				// Gradientų animacijos
				'gradient-shift': 'gradient-shift 4s ease infinite',
				'gradient-x': 'gradient-x 3s ease infinite',
				// Pulsing ir glow
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				'shimmer': 'shimmer 2s linear infinite',
				// Rašymo efektai
				'typewriter': 'typewriter 3s steps(40, end)',
				'blink': 'blink 1s step-end infinite',
				// Morfingo efektai
				'morph': 'morph 4s ease-in-out infinite',
				// Skaičių animacijos
				'count-up': 'count-up 0.6s ease-out',
				// Dalelių animacijos
				'particle-float': 'particle-float 15s linear infinite',
				// Staggered animacijos
				'slide-in-left': 'slide-in-left 0.8s ease-out',
				'slide-in-right': 'slide-in-right 0.8s ease-out',
				'scale-in': 'scale-in 0.6s ease-out',
				// 3D efektai
				'card-flip': 'card-flip 0.6s ease-in-out',
				'card-hover': 'card-hover 0.3s ease-out',
				// Vibrant new animations
				'neon-glow': 'neon-glow 3s ease-in-out infinite',
				'aurora-wave': 'aurora-wave 8s ease-in-out infinite',
				'bubble-rise': 'bubble-rise 12s linear infinite',
				'wobble': 'wobble 2s ease-in-out infinite',
				'matrix-rain': 'matrix-rain 10s linear infinite',
				'rainbow-shift': 'rainbow-shift 4s linear infinite',
				'rotating-border': 'rotating-border 3s ease-in-out infinite'
			},
			backgroundSize: {
				'300%': '300%'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
