using LinkDev.MOS.SuperApp.DataAccess;
using Linkdev.MOS.SuperApp.Business.Interfaces;
using Linkdev.MOS.SuperApp.Business.Services;
using LinkDev.MOS.SuperApp.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Linkdev.MOS.SuperApp.Business.Filters;

var builder = WebApplication.CreateBuilder(args);

//builder.Services.AddDbContext<AdminDbContext>(options =>
//   options.UseSqlServer(builder.Configuration.GetConnectionString("AdminDb")));

//builder.Services.AddDbContext<InboxDbContext>(options =>
//    options.UseSqlServer(builder.Configuration.GetConnectionString("InboxDb")));

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddDataAccessServices(builder.Configuration);
builder.Services.AddIdentityServices(builder.Configuration);

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAngularFrontend");
app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();


app.Run();
