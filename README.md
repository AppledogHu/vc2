    SD-8510 technical document

Welcome to VC-2, otherwise known as “Stellar Dynamics SD-8510 CPU” and the KERNAL ROM V2 that goes along with it. VC-2 is the direct successor of the VC-1 project.

== About ==

In 2025, Based on my experiences with what became VC-1 and as a project to work with Neo again, I came up with the concept for VC-2. The idea of Web Assembly is that you need javascript access functions to work on the DOM. But, I thought, Javascript is essentially uncompiled web assembly. Something like that. So I set up the canvas from JTTD v3 and I added a simple keydown handler. Everything else was run on the SD-8510.

== What is the SD-8510? ==

What if? What if PCs never went mainstream? What if the processor designs of the 70s and early 80s were updated one more time to make a new system? What if the 386 came just one generation later? Or what if the giants of yesteryear made one final effort to overthrow the enroachment of the 80×86?

What if there was an alternate timeline where instead of abandoning the old ways, we continued on and tried to make them fit in the 90s? You know, give it the old college try! Remember, by 1985 we already had the 386 and the old 8 bit systems future was written on the wall…. But, what if?

In that sense, the SD-8510 is a real CPU–It's not an emulator. The naming is intentional – no such CPU ever existed but, the C64 ran on a 6510, and the C128 ran on an 8502… What if, there was a super-updated next gen chip that was similar to those, but also, completely different?

Well, I did it! It's a complete, fully functioning CPU! And the kicker is that everything it does is written in SDA assembly language! Yes, it has a KERNAL ROM written in assembly and all the javascript assembler does is load the assembly into memory and everything just works on the CPU!

It's… well, it's amazing! It is all at once the most difficult, the most satisfying, the most rewarding and the coolest thing I have ever programmed.

I don't even know where to begin. You have to try this.

== What I learned  == 

I learned that assembly and C are much closer than I thought. The system design was the easy part. The months of grind-coding the assembler and opcodes, testing and debugging the CPU, was the easy part. Most of the time spent on this project was in writing the KERNAL. It felt at times that I was writing the standard C library over again in assembly. When I realized this, I realized that good assembly language programing is a lot like C; at least, the way I write C seems strongly influenced by my experience with assembly.

A javascript wrapper to push an image to a canvas. A keydown handler. And we had everything we needed. I am so proud of my work on VC-2! But I am also very excited about what comes next. A VC-3 would likely be written in web assembly. The difficult choice there is actually that I don't trust web assembly to be as ubiquitous as JavaScript. It would be faster, though.

    I heard you like assembly so I wrote a cpu and operating system in assembly
    so you can write a CPU and an operating system in assembly.
    –Unknown
