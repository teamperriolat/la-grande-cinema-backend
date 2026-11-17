import { Body, Controller, Post } from '@nestjs/common';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';
export class LoginDto {
  @ApiProperty({ example: 'user@demo.cinema' }) @IsEmail() email: string;
  @ApiProperty({ example: 'DemoUser123!' }) @IsString() @MinLength(8) password: string;
}
@ApiTags('auth') @Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post('login') login(@Body() dto: LoginDto) { return this.auth.login(dto); }
}
