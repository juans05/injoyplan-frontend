import privacy from './../../../public/svg/privacy.svg'
import Image from 'next/image'
import { jakarta } from '../../../public/fonts';
import Link from 'next/link'

const CookiesPolicy = () => {
    return (
        <div className="">
            <div className='bg-[#F8FAFB]'>
                <div className="pt-10 max-w-screen-md mx-auto flex items-center justify-start px-10">
                    <div className="">
                        <Image src={privacy} alt="cookiesimg" className='w-full' />
                    </div>
                    <div>
                        <h3 className={`${jakarta.className} md:ml-28 ml-10 text-3xl font-bold text-[#9B292B]`}>Políticas de Cookies</h3>
                    </div>
                </div>
            </div>
            <div className={`${jakarta.className} max-w-[1200px] px-5 md:px-8 xl:px-0 md:mt-20 mt-12 mx-auto`}>

                {/* Introducción */}
                <div className="mb-8">
                    <p className='text-[#333] md:text-[16px] text-[14px]'>
                        Nosotros, <strong>INJOYPLAN S.A.C.</strong> (en adelante, Injoyplan), con R.U.C. Nro. 20603074956, informamos acerca del uso de las cookies en nuestro sitio web: <Link href="https://www.injoyplan.com" className="text-[#007FA4] hover:underline">www.injoyplan.com</Link>.
                        <br /><br />
                        En cumplimiento con lo dispuesto en la Ley N° 27933, Ley de Protección de Datos personales y su reglamento, el D.S. 003-2013-JUS, les informamos en esta sección sobre la política de recogida y tratamiento de cookies.
                        <br /><br />
                        La presente política establece los tipos de cookies y otras tecnologías que Injoyplan utiliza cuando visites nuestros sitios web o aplicaciones, además, de precisar cómo se utiliza en la publicidad.
                    </p>
                </div>

                {/* ¿Qué son las cookies? */}
                <div className="mb-8">
                    <h5 className='text-[#333] md:text-[16px] text-[14px] font-bold mb-4'>¿QUÉ SON LAS COOKIES?</h5>
                    <p className='text-[#333] md:text-[16px] text-[14px]'>
                        Las cookies son pequeños archivos de información que los sitios web o aplicaciones que visitas colocan en tu ordenador o dispositivo móvil, permitiendo que los sitios web o aplicaciones guarden información sobre las acciones realizadas. Las cookies permiten a un sitio web, entre otras cosas, almacenar y recuperar información sobre los hábitos de navegación de un usuario o de su equipo y, dependiendo de la información que contengan y de la forma en que utilice su equipo, pueden utilizarse para fines de funcionalidad, analíticos, de publicidad o mejorar la experiencia de los usuarios.
                    </p>
                </div>

                {/* Tipos de cookies */}
                <div className="mb-8">
                    <h5 className='text-[#333] md:text-[16px] text-[14px] font-bold mb-4'>TIPOS DE COOKIES QUE UTILIZAMOS</h5>
                    <p className='text-[#333] md:text-[16px] text-[14px] mb-4'>Las cookies que utilizamos son las siguientes:</p>

                    <div className="space-y-6">
                        <div>
                            <h6 className='text-[#333] md:text-[16px] text-[14px] font-bold mb-2'>Cookies de análisis:</h6>
                            <p className='text-[#333] md:text-[16px] text-[14px]'>
                                Son aquéllas que bien tratadas por nosotros o por terceros, nos permiten cuantificar el número de usuarios y así realizar la medición y análisis estadístico de la utilización que hacen los usuarios del servicio ofertado, ayudando a recoger datos que permiten a los servicios entender cómo interactúas con un servicio en particular. Para ello se analiza su navegación en nuestro sitio web o aplicación con el fin de mejorar la oferta de productos o servicios que ofrecemos, mediante el recojo de información para ofrecer estadísticas de uso sin que se identifique personalmente a cada visitante.
                            </p>
                        </div>

                        <div>
                            <h6 className='text-[#333] md:text-[16px] text-[14px] font-bold mb-2'>Cookies técnicas:</h6>
                            <p className='text-[#333] md:text-[16px] text-[14px]'>
                                Son aquellas que permiten al usuario la navegación a través del área restringida y la utilización de sus diferentes funciones requeridas para el buen funcionamiento del sitio web o aplicación, como por ejemplo, llevar a cambio el proceso de compra de un artículo.
                            </p>
                        </div>

                        <div>
                            <h6 className='text-[#333] md:text-[16px] text-[14px] font-bold mb-2'>Cookies de personalización:</h6>
                            <p className='text-[#333] md:text-[16px] text-[14px]'>
                                Son aquellas que permiten al usuario acceder al servicio con algunas características de carácter general predefinidas en función de una serie de criterios en el terminal del usuario, mejorando la experiencia al proporcionar contenido y funciones personalizados, dependiendo de la configuración elegida o de la configuración de la aplicación o dispositivo.
                            </p>
                        </div>

                        <div>
                            <h6 className='text-[#333] md:text-[16px] text-[14px] font-bold mb-2'>Cookies publicitarias:</h6>
                            <p className='text-[#333] md:text-[16px] text-[14px]'>
                                Son aquéllas que, bien tratadas por este sitio web o por terceros, permiten gestionar de la forma más eficaz posible la oferta de los espacios publicitarios que hay en el sitio web o aplicación, adecuando el contenido del anuncio al contenido del servicio solicitado o al uso que realice de nuestro sitio web. Para ello podemos analizar sus hábitos de navegación en Internet y podemos mostrarle publicidad relacionada con su perfil de navegación.
                            </p>
                        </div>

                        <div>
                            <h6 className='text-[#333] md:text-[16px] text-[14px] font-bold mb-2'>Cookies de publicidad comportamental:</h6>
                            <p className='text-[#333] md:text-[16px] text-[14px]'>
                                Son aquellas que permiten la gestión, de la forma más eficaz posible, de los espacios publicitarios que, en su caso, el editor haya incluido en un sitio web, aplicación o plataforma desde la que presta el servicio solicitado. Este tipo de cookies almacenan información del comportamiento de los visitantes obtenida a través de la observación continuada de sus hábitos de navegación, lo que permite desarrollar un perfil específico para mostrar avisos publicitarios en función del mismo.
                            </p>
                        </div>

                        <div>
                            <h6 className='text-[#333] md:text-[16px] text-[14px] font-bold mb-2'>Cookies de seguridad:</h6>
                            <p className='text-[#333] md:text-[16px] text-[14px]'>
                                Son aquellas que se usan con fines de seguridad ayudan a autenticar a los usuarios, prevenir el fraude y protegerte cuando interactúas con un servicio. Las cookies y otras tecnologías que se usan para autenticar a los usuarios permiten asegurar que solo el propietario de una cuenta puede acceder a ella. Algunas cookies y otras tecnologías se usan para prevenir el spam, el fraude y los abusos. Estas cookies evitan que sitios maliciosos actúen haciéndose pasar por el usuario sin su conocimiento.
                            </p>
                        </div>

                        <div>
                            <h6 className='text-[#333] md:text-[16px] text-[14px] font-bold mb-2'>Cookies de complementos:</h6>
                            <p className='text-[#333] md:text-[16px] text-[14px]'>
                                Las cookies de complementos son aquellas que se generan al usar complementos de proveedores externos de contenido y que permiten a los usuarios acceder a contenidos o servicios proporcionados por terceros, como por ejemplo, las localizaciones en Google Maps, o el acceso a YouTube.
                            </p>
                        </div>

                        <div>
                            <h6 className='text-[#333] md:text-[16px] text-[14px] font-bold mb-2'>Cookies de redes sociales:</h6>
                            <p className='text-[#333] md:text-[16px] text-[14px]'>
                                Son aquellas necesarias para compartir información del sitio web o aplicación de Injoyplan en las diferentes redes sociales existentes.
                            </p>
                        </div>

                        <div>
                            <h6 className='text-[#333] md:text-[16px] text-[14px] font-bold mb-2'>Cookies de reproductor multimedia:</h6>
                            <p className='text-[#333] md:text-[16px] text-[14px]'>
                                Las cookies del reproductor de contenido permiten la reproducción de audio o video. Supongamos que un usuario se desplaza por una web y encuentra un archivo de video de reproducción automática. Las cookies del reproductor multimedia permiten que se reproduzca ese video.
                            </p>
                        </div>

                        <div>
                            <h6 className='text-[#333] md:text-[16px] text-[14px] font-bold mb-2'>Cookies de sesión:</h6>
                            <p className='text-[#333] md:text-[16px] text-[14px]'>
                                Las cookies de sesión caducan inmediatamente o pocos segundos después de que el usuario abandone el navegador web. Entre otros usos, estas cookies son utilizadas por sitios web que tienen opción de comercio electrónico para recordar el producto colocado en el carrito por el usuario, para mantener a los usuarios conectados y para calcular cada sesión de usuario con fines analíticos. Por ejemplo, si un sitio web de comercio electrónico no utiliza cookies de sesión, los artículos agregados en el carrito se eliminarán cuando el usuario llegue a la página de pago, y el servidor olvidará al usuario y lo tratará como un visitante completamente nuevo.
                            </p>
                        </div>
                    </div>

                    <p className='text-[#333] md:text-[16px] text-[14px] mt-6'>
                        En el supuesto de que en el sitio web o aplicación de Injoyplan se coloquen enlaces o hipervínculos que lo redireccionen a otros sitios webs o aplicaciones, que son de propiedad de terceros que utilicen cookies, Injoyplan no se hace responsable del uso de cookies por parte de dichos terceros.
                    </p>
                </div>

                {/* Cookies de terceros */}
                <div className="mb-8">
                    <h5 className='text-[#333] md:text-[16px] text-[14px] font-bold mb-4'>COOKIES DE TERCEROS</h5>
                    <p className='text-[#333] md:text-[16px] text-[14px]'>
                        En este sitio web o aplicación utiliza servicios de terceros para recopilar información con fines estadísticos y de uso de los mismos. Se usan cookies de DoubleClick para mejorar la publicidad que se incluye en el sitio web o aplicación. Son utilizadas para orientar la publicidad según el contenido que es relevante para cada usuario, mejorando así la calidad de experiencia en el uso del mismo.
                        <br /><br />
                        En concreto, usamos los servicios de Google Adsense y de Google Analytics para nuestras estadísticas y publicidad. Algunas cookies son esenciales para el funcionamiento del sitio web y aplicación, por ejemplo el buscador incorporado.
                        <br /><br />
                        Nuestro sitio incluye otras funcionalidades proporcionadas por terceros. Usted puede fácilmente compartir el contenido en redes sociales con los botones que hemos incluido a tal efecto.
                    </p>
                </div>

                {/* Desactivar las cookies */}
                <div className="mb-8">
                    <h5 className='text-[#333] md:text-[16px] text-[14px] font-bold mb-4'>DESACTIVAR LAS COOKIES</h5>
                    <p className='text-[#333] md:text-[16px] text-[14px] mb-4'>
                        Puedes permitir, bloquear o eliminar las cookies instaladas en tu equipo mediante la configuración de las opciones del navegador instalado en tu ordenador. En la mayoría de los navegadores web se ofrece la posibilidad de permitir, bloquear o eliminar las cookies instaladas en tu equipo. A continuación puedes acceder a la configuración de los navegadores webs más frecuentes para aceptar, instalar o desactivar las cookies:
                    </p>

                    <ul className='text-[#333] md:text-[16px] text-[14px] space-y-3 list-none'>
                        <li>
                            <strong>Configurar cookies en Google Chrome:</strong><br />
                            <Link href="https://support.google.com/chrome/answer/95647?hl=es" target="_blank" className="text-[#007FA4] hover:underline break-all">
                                https://support.google.com/chrome/answer/95647?hl=es
                            </Link>
                        </li>
                        <li>
                            <strong>Configurar cookies en Microsoft Internet Explorer:</strong><br />
                            <Link href="https://support.microsoft.com/es-es/windows" target="_blank" className="text-[#007FA4] hover:underline break-all">
                                https://support.microsoft.com/es-es/windows
                            </Link>
                        </li>
                        <li>
                            <strong>Configurar cookies en Mozilla Firefox:</strong><br />
                            <Link href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" className="text-[#007FA4] hover:underline break-all">
                                https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias
                            </Link>
                        </li>
                        <li>
                            <strong>Configurar cookies en Safari (Apple):</strong><br />
                            <Link href="https://support.apple.com/es-es/HT201265" target="_blank" className="text-[#007FA4] hover:underline break-all">
                                https://support.apple.com/es-es/HT201265
                            </Link>
                        </li>
                        <li>
                            <strong>Configurar cookies en Microsoft Edge:</strong><br />
                            <Link href="https://privacy.microsoft.com/es-es/windows-10-microsoft-edge-and-privacy" target="_blank" className="text-[#007FA4] hover:underline break-all">
                                https://privacy.microsoft.com/es-es/windows-10-microsoft-edge-and-privacy
                            </Link>
                        </li>
                        <li>
                            <strong>Configurar cookies en Opera:</strong><br />
                            <Link href="https://help.opera.com/Windows/11.50/es-ES/cookies.html" target="_blank" className="text-[#007FA4] hover:underline break-all">
                                https://help.opera.com/Windows/11.50/es-ES/cookies.html
                            </Link>
                        </li>
                    </ul>

                    <p className='text-[#333] md:text-[16px] text-[14px] mt-4'>
                        No obstante lo anterior, advertimos que el uso de las cookies nos permite ofrecerte una mejor experiencia en nuestros servicios. En caso de realizar modificaciones en la configuración de las cookies, es posible que tu experiencia de navegación no sea óptima.
                    </p>
                </div>

                {/* Advertencia sobre eliminar cookies */}
                <div className="mb-8">
                    <h5 className='text-[#333] md:text-[16px] text-[14px] font-bold mb-4'>ADVERTENCIA SOBRE ELIMINAR COOKIES</h5>
                    <p className='text-[#333] md:text-[16px] text-[14px]'>
                        Usted puede eliminar y bloquear todas las cookies de este sitio, pero parte del sitio no funcionará o la calidad del sitio web o aplicativo móvil pueden verse afectados.
                        <br /><br />
                        Si tiene cualquier duda acerca de nuestra política de cookies, puede contactar con esta página web a través de nuestros canales de contacto.
                        <br /><br />
                        Asimismo, podrá ejercer sus derechos ARCO a través del botón de <Link href="/contactanos" className="text-[#007FA4] hover:underline">Contáctanos</Link>, disponible en nuestra página web <Link href="https://www.injoyplan.com" className="text-[#007FA4] hover:underline">www.injoyplan.com</Link>.
                    </p>
                </div>

                {/* Frecuencia de actualización */}
                <div className="mb-8">
                    <h5 className='text-[#333] md:text-[16px] text-[14px] font-bold mb-4'>FRECUENCIA DE ACTUALIZACIÓN DE POLÍTICA DE COOKIES</h5>
                    <p className='text-[#333] md:text-[16px] text-[14px]'>
                        Injoyplan se reserva el derecho de actualizar esta Política de Cookies de vez en cuando por motivos operativos, legales, a fin de garantizar un mejor servicio y cumplir con la normativa vigente. En el supuesto que esta política se modifique, se solicitará de nuevo tu aceptación a los nuevos términos.
                    </p>
                </div>

                {/* Consentimiento */}
                <div className="mb-8">
                    <h5 className='text-[#333] md:text-[16px] text-[14px] font-bold mb-4'>CONSENTIMIENTO SOBRE EL USO DE COOKIES</h5>
                    <p className='text-[#333] md:text-[16px] text-[14px]'>
                        Al aceptar la presente Política de Cookies manifiestas tu conformidad con los términos aquí establecidos, otorgándonos tu autorización para utilizar las cookies antes mencionadas propias o de terceros, teniendo en cuenta que estas últimas no son gestionadas por Injoyplan.
                    </p>
                </div>

                {/* Fecha */}
                <div className="mb-12">
                    <p className='text-[#333] md:text-[16px] text-[14px] italic'>
                        Septiembre de 2025
                    </p>
                </div>

            </div>
            <hr />
        </div>
    )
}

export default CookiesPolicy
