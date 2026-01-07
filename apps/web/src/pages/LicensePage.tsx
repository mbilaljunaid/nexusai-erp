import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { Header, Footer } from "@/components/Navigation";
import { Scale, Download, ExternalLink } from "lucide-react";
import { Link } from "wouter";

export default function LicensePage() {
  useEffect(() => {
    document.title = "License | NexusAIFirst - AGPL-3.0";
  }, []);

  return (
    <div className="public-page min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="px-4 py-12 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Scale className="w-12 h-12 mx-auto mb-4 text-blue-500" />
            <h1 className="text-4xl font-bold mb-4">License</h1>
            <p className="text-muted-foreground">
              NexusAIFirst is licensed under the GNU Affero General Public License v3.0
            </p>
          </div>

          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">GNU AFFERO GENERAL PUBLIC LICENSE</h2>
            <h3 className="text-xl font-semibold mb-4">Version 3, 19 November 2007</h3>
            
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <p className="mb-4">
                Copyright (C) 2007 Free Software Foundation, Inc. &lt;https://fsf.org/&gt;
              </p>
              <p className="mb-6">
                Everyone is permitted to copy and distribute verbatim copies of this license document, but changing it is not allowed.
              </p>

              <h4 className="text-lg font-semibold mt-8 mb-4">Preamble</h4>
              <p className="mb-4">
                The GNU Affero General Public License is a free, copyleft license for software and other kinds of works, specifically designed to ensure cooperation with the community in the case of network server software.
              </p>
              <p className="mb-4">
                The licenses for most software and other practical works are designed to take away your freedom to share and change the works. By contrast, our General Public Licenses are intended to guarantee your freedom to share and change all versions of a program--to make sure it remains free software for all its users.
              </p>
              <p className="mb-4">
                When we speak of free software, we are referring to freedom, not price. Our General Public Licenses are designed to make sure that you have the freedom to distribute copies of free software (and charge for them if you wish), that you receive source code or can get it if you want it, that you can change the software or use pieces of it in new free programs, and that you know you can do these things.
              </p>
              <p className="mb-4">
                Developers that use our General Public Licenses protect your rights with two steps: (1) assert copyright on the software, and (2) offer you this License which gives you legal permission to copy, distribute and/or modify the software.
              </p>
              <p className="mb-4">
                A secondary benefit of defending all users' freedom is that improvements made in alternate versions of the program, if they receive widespread use, become available for other developers to incorporate. Many developers of free software are heartened and encouraged by the resulting cooperation. However, in the case of software used on network servers, this result may fail to come about. The GNU General Public License permits making a modified version and letting the public access it on a server without ever releasing its source code to the public.
              </p>
              <p className="mb-4">
                The GNU Affero General Public License is designed specifically to ensure that, in such cases, the modified source code becomes available to the community. It requires the operator of a network server to provide the source code of the modified version running there to the users of that server. Therefore, public use of a modified version, on a publicly accessible server, gives the public access to the source code of the modified version.
              </p>

              <h4 className="text-lg font-semibold mt-8 mb-4">Key Terms</h4>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li><strong>Freedom to Use:</strong> You may use NexusAIFirst for any purpose</li>
                <li><strong>Freedom to Study:</strong> You may examine how NexusAIFirst works and modify it</li>
                <li><strong>Freedom to Share:</strong> You may redistribute copies of NexusAIFirst</li>
                <li><strong>Freedom to Improve:</strong> You may distribute your modified versions</li>
                <li><strong>Network Copyleft:</strong> If you run a modified version on a server and let users interact with it, you must make the source code available to them</li>
              </ul>

              <div className="bg-muted p-4 rounded-lg mt-8">
                <p className="text-sm">
                  For the complete license text, please visit: <a href="https://www.gnu.org/licenses/agpl-3.0.txt" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">https://www.gnu.org/licenses/agpl-3.0.txt</a>
                </p>
              </div>
            </div>
          </Card>

          <div className="flex gap-4 justify-center flex-wrap">
            <a href="https://www.gnu.org/licenses/agpl-3.0.txt" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" data-testid="button-download-license">
                <Download className="mr-2 w-4 h-4" /> Download Full License
              </Button>
            </a>
            <Link to="/open-source">
              <Button data-testid="button-open-source">
                Learn About Open Source <ExternalLink className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
